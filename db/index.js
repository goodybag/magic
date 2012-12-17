
/**
 * Module dependencies
 */

var
  // Configuration
  config = require('../config')

  // Database
  pg = require('pg').native
, sql = require('sql')

  // Promise to fullfil this variable!
, client = null

  // Other packages in use
// , pooler = require('generic-pool')
;

exports.pg = pg;
exports.sql = sql;

// TODO: I don't think this is using the connection pool
// find out best way to do this

pg.connect(config.postgresConnStr, function(error, _client){
  if (error) throw error;

  client = _client;
});

exports.getClient = function(callback){
  /*
  pg.connect(config.postgres.connectionString, function(err, client){
    callback(err, client);
  });
*/
  callback(null, client);
};

exports.tables = {
  businesses: require('./schemas/businesses')
, locations:  require('./schemas/locations')
, users:      require('./schemas/users')
, groups:     require('./schemas/groups')
, userGroups: require('./schemas/userGroups')
, locations: require('./schemas/locations')
, products: require('./schemas/products')
}

/*
exports.pool = pooler.Pool(
  {
    name: 'postgres'
  , create: function(cb) {
      var client = new pg.Client(config.postgres.connectionString);
      client.connect(function(err){
        if (err != null) return cb(err);
        client.on('error', function(err){
          console.log('Error in postgres client, removing from pool');
          pgPool.destroy(client);
        });
        client.pauseDrain();

        client.on('drain', function(){
          pool.release(client);
        })

        client.pool = function(){
          client.resumeDrain();
        };

        client.begin = function(callback){
          client.query('BEGIN', function(err){
            callback(err);
          });
        };

        client.savePoint = function(savePoint, callback) {
          client.query('SAVEPOINT ' + savePoint, function(err){
            callback(err);
          });
        };

        client.commit = function(callback){
          client.query('COMMIT', function(err){
            callback(err);
            client.resumeDrain();
          });
        };

        client.rollback = function(savedPoint, callback){
          if(typeof(savedPoint) === 'function'){
            savedPoint = null;
            callback = savedPoint;
          }

          var query = (savedPoint != null) ? 'ROLLBACK TO SAVEPOINT ' + savedPoint : 'ROLLBACK';

          client.query(query, function(err){
            callback(err);

            if (savePoint == null) client.resumeDrain();
          });
        };

        cb(null, client);
      });
    }
  , destroy: function(client){
      client.end();
    }
  , max: 100
  , idleTimeoutMillis: 30*1000
  , reapIntervalMillis: 1000
  , log: true //remove if not debugging
  }
);


// Usage (in another file that requires this one)

pool.acquire(function(err, client){
  client.begin(function(err){
    if(err != null) return res.send('DB got prablums');

    client.query('INSERT INTO ....', function(err, result){
      if (err != null) {
        client.rollback(function(err){
          if(err != null) return res.send('DB got prablums');
        })
      }
      client.commit(function(err){
        if(err != null) return res.send('DB got prablums');
      });
    });
  })
});
*/