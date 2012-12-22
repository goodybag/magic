
/**
 * Module dependencies
 */

var
  // Configuration
  config = require('../config')

  // Database
  pg = require('pg')
, sql = require('sql')
, pooler = require('generic-pool')

  // Promise to fullfil this variable!
, client = null

  // Other packages in use
// , pooler = require('generic-pool')
;

exports.pg = pg;
exports.sql = sql;

// TODO: I don't think this is using the connection pool
// find out best way to do this


var pool = pooler.Pool({
  name: 'postgres'
, max: 10
, create: function(callback) {
    new pg.Client(config.postgresConnStr).connect(function(err, client) {

      if(err) return callback(err);

      client.on('error', function(e) {
        self.emit('error', e, client);
        pool.destroy(client);
      });

      client.on('drain', function() {
        pool.release(client);
      });

      callback(err, client);
    });
  }
, destroy: function(client) {
    client.end();
  }
, max: 30
, idleTimeoutMillis: 30 * 1000
, reapIntervalMillis: 1000
});

exports.getClient = function(callback){

  return pool.acquire(callback);
  // callback(null, client);
};

exports.schemas = {
  businesses:                require('./schemas/businesses')
, locations:                 require('./schemas/locations')
, users:                     require('./schemas/users')
, groups:                    require('./schemas/groups')
, userGroups:                require('./schemas/userGroups')
, products:                  require('./schemas/products')
, productCategories:         require('./schemas/productCategories')
, productsProductCategories: require('./schemas/productsProductCategories')
, photos:                    require('./schemas/photos')
, productTags:               require('./schemas/productTags')
};

function buildTable(name, schema) {
  var columns = [];
  for (var field in schema) {
    columns.push(field);
  }
  return sql.define({
    name: name
  , columns: columns
  });
}

exports.tables = {};
for (var name in exports.schemas) {
  exports.tables[name] = buildTable(name, exports.schemas[name])
}

// Application behavior
// (when run from the command-line, do setup)
if (require.main === module) {
  /**
   * Runs DB setup
   */

  require('./setup')({ verbose:true }, function(error){
    if (error) throw error;
    console.log('complete!');
    process.exit(0);
  });
}