/**
 * Setup database
 *
 * Will connect to the postgres database specified in config and
 * drop all tables specified in config.schemaFiles, and then will
 * re-create them using the schema in the file.
 *
 * NOTE: this assumes that the filename for the schema
 * corresponds to the actual collection name in the database.
 */

var
  fs       = require('fs')
, pg       = require('pg')
, when     = require('when')
, pipeline = require('when/pipeline')
, sequence = require('when/sequence')
, async    = require('async')
, config   = require('./config')
, copper   = require('./copper')

, client   = null
, verbose  = false
;

function loadFile(log, file) {
  return function() {
    if (verbose) { console.log(log); }
    var sql = when.defer();
    fs.readFile(file, 'utf-8', function(error, data){
      if (error) {
        console.log('Error loading', file, error);
        sql.reject(error);
      } else {
        sql.resolve(data);
      }
    });
    return sql.promise;
  };
}

function buildCreateTableSql(log, name) {
  return function() {
    if (verbose) { console.log(log); }
    var sql = [];
    var schema = require(__dirname + '/schemas/' + name);
    // assemble the CREATE TABLE command from the schema structure
    for (var field in schema) {
      var parts = ['"'+field+'"', schema[field].type];
      if (schema[field].meta) {
        parts.push(schema[field].meta);
      }
      sql.push(parts.join(' '));
    }
    return 'CREATE TABLE "'+name+'" ( '+sql.join(', ')+' );';
  };
}

function buildDropIndexSql(log, schemaFile) {
  return function() {
    if (verbose) { console.log(log); }
    var sql = [];
    var schema = require(__dirname + '/schemas/' + schemaFile);
    // assemble the DROP INDEX command from the schema structure
    for (var name in schema) {
      sql.push('DROP INDEX IF EXISTS '+name+';');
    }
    return sql.join(' ');
  };
}

function buildCreateIndexSql(log, schemaFile) {
  return function() {
    if (verbose) { console.log(log); }
    var sql = [];
    var schema = require(__dirname + '/schemas/' + schemaFile);
    // assemble the CREATE INDEX command from the schema structure
    for (var name in schema) {
      var index = schema[name];
      sql.push([
        'CREATE', (index.type) ? index.type : '', 'INDEX', '"'+name+'"', 'ON', '"'+index.table+'"',
          (index.using) ? 'USING '+index.using : '',
          index.columns
      ].join(' '));
    }
    return sql.join('; ');
  };
}

function query(log, sql) {
  return function(paramSql) {
    // not given a query to run?
    if (!sql) { sql = paramSql; } // run query returned by last item in the pipeline
    if (!log) { log = sql; }
    if (verbose) { console.log(log); }
    var query = client.query(sql);
    var deferred = when.defer();
    query.on('error', function(e) { console.log(e); });
    query.on('end', deferred.resolve);
    return deferred.promise;
  };
}

function loadTableSchema(name) {
  return pipeline([
    query( 'Dropping Sequence for ' + name, 'drop sequence if exists "' + name + '_id_seq" cascade'),
    query( 'Dropping ' + name,              'drop table if exists "' + name + '" cascade'),
    buildCreateTableSql('Creating ' + name, name),
    query() // will run what getSql returns
  ]);
}

function loadIndexSchema() {
  return pipeline([
    buildDropIndexSql('Dropping old indices', 'indices'),
    query(),
    buildCreateIndexSql('Creating new indices', 'indices'),
    query()
  ]);
}

function loadSqlFile(name, path, message) {
  return function() {
    if (!name) { return; }
    return pipeline([
      loadFile(message, path+name+'.sql'),
      query()
    ]);
  };
}

function setupCopper(options){
  var deferred = when.defer()

  // Get copper ready
  if (verbose) console.log("Building Copper");

  var dropTables = function(done){
    var sql = [];

    if (copper.tables.length == 0) return done();

    for (var i = 0, l = copper.tables.length; i < l; ++i){
      sql.push('drop table if exists "' + copper.tables[i] + '" cascade;');
    }

    copper.query( sql.join('\n'),  done);
  };

  var onSeriesComplete = function(error, results){
    if (error) return deferred.reject(error);
    deferred.resolve(true);
  };

  // Couldn't get when.js to stop being stupid
  async.series( [ dropTables ].concat( fs.readdirSync( __dirname + '/' + options.copperDeltas ).sort().map(function(file){
    return function(done){
      if ( file.substring( file.length - 3 ) != 'sql' ) return done();

      if (verbose) console.log("  - Running Delta:", __dirname + '/' + options.copperDeltas + '/' + file);

      copper.query(
        fs.readFileSync(__dirname + '/' + options.copperDeltas + '/' + file).toString()
      , done
      );
    };
  })), onSeriesComplete);

  return deferred.promise;
}

module.exports = function(options, callback){
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};
  options.postgresConnStr = options.postgresConnStr || config.postgresConnStr;
  options.schemaFiles     = options.schemaFiles     || config.schemaFiles;
  options.fixtureFile     = options.fixtureFile     || config.fixtureFile;
  options.copperDeltas    = options.copperDeltas    || 'copper/deltas'
  verbose = options.verbose;

  // connect to postgres
  if (verbose) { console.log('Connecting to Postgres database'); }
  pg.connect(options.postgresConnStr, function(error, pgClient, done) {
    if (error) return callback(error);
    client = pgClient;

    // run loadschema on all files
    when(loadSqlFile('presetup_idempotent', __dirname+'/', 'Loading idempotent presetup')())
      .then(function() { return when.map(options.schemaFiles, loadTableSchema); })
      .then(loadIndexSchema)
      .then(loadSqlFile(options.fixtureFile, __dirname+'/fixtures/', 'Loading fixture'))
      .then(function(){ return setupCopper(options); })
      .then(function() { callback(null); }, callback)
      .then(null, function() { console.log('FAILURE', arguments) })
      .always(function() { done(); })
    ;
  });
};
