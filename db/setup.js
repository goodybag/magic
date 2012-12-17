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
, config   = require('./config')

, client   = null
, verbose  = false
;

function getSql(log, file) {
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
  }
}

function query(log, sql) {
  return function(paramSql) {
    // not given a query to run?
    if (!sql) { sql = paramSql; } // run query returned by last item in the pipeline
    if (!log) { log = sql; }
    if (verbose) { console.log(log); }

    var query = client.query(sql);
    var deferred = when.defer();
    query.on('end', deferred.resolve);
    return deferred.promise;
  }
}

function loadSchema(name) {
  return pipeline([
    query( 'Dropping Sequence for ' + name, 'drop sequence if exists ' + name + '_id_seq cascade'),
    query( 'Dropping ' + name,              'drop table if exists ' + name + ' cascade'),
    getSql('Creating ' + name,              __dirname + '/../collections/' + name + '/schema/definition.sql'),
    query() // will run what getSql returns
  ]);
}

function loadFixture(name) {
  return function() {
    if (!name) { return; }
    return pipeline([
      getSql('Loading fixture', __dirname+'/fixtures/'+name+'.sql'),
      query()
    ]);
  }
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

  verbose = options.verbose;

  // connect to postgres
  if (verbose) { console.log('Connecting to Postgres database'); }
  pg.connect(options.postgresConnStr, function(error, pgClient) {
    if (error) return callback(error);
    client = pgClient;

    // run loadschema on all files
    when.map(options.schemaFiles, loadSchema)
      .then(loadFixture(options.fixtureFile))
      .then(function() { callback(null); }, callback)
      .always(function() { client.end(); })
    ;

  });
};