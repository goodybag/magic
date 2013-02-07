
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
, Transaction = require('pg-transaction')

, fields = require('./fields')

  // Promise to fullfil this variable!
, client = null

  // Other packages in use
// , pooler = require('generic-pool')
, async = require('async')
, logger = require('../lib/logger')({app: 'api', component: 'db'});
;

exports.pg = pg;
exports.sql = sql;
exports.procedures = require('./procedures');

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

/**
 * Uses a transaction to update a record and insert if DNE
 * @param  {Object} client       PostGres db client
 * @param  {String} updateQuery  Update query to attempt first
 * @param  {Array}  updateValues Values to use in the update query
 * @param  {String} insertQuery  Insert query to attempt if update did not affect any rows
 * @param  {Array}  insertValues Values to use in the insert query
 * @param  {Func}   originalCb   Callback on completion
 * @param  {Object} tx           Optional. PostGres transaction to use (created if not given)
 * @return undefined
 */
exports.upsert = function(client, updateQuery, updateValues, insertQuery, insertValues, tx, originalCb) {
  if (typeof tx == 'function') {
    originalCb = tx;
    tx = null;
  }

  var shouldCommitOnFinish = (!tx); // commit on finish if we're not given a transaction
  var savePointed = false;
  var stage = ''; // for logging

  // checks into our upsert to see if we've finished or not
  var checkResults = function(continueCb) {
    return function(err, results) {
      if (err) {
        // an error, abort
        if (savePointed) { tx.release('upsert'); }
        tx.abort(function() { originalCb(err); });
      } else {
        if (results[1].rowCount === 1) {
          // success, we're done
          if (savePointed) { tx.release('upsert'); }
          if (shouldCommitOnFinish) {
            tx.commit(function(error){
              originalCb(error, results[1]);
            });
          } else {
            originalCb(null, results[1]);
          }
        } else {
          // carry on
          continueCb && continueCb();
        }
      }
    };
  };

  // try to update first
  async.series([
    function(cb) {
      // init transaction
      stage = 'begin';
      if (!tx) {
        tx = new Transaction(client);
        tx.begin(cb);
      } else {
        cb();
      }
    },
    function(cb) {
      // run update
      stage = 'update1';
      tx.query(updateQuery, updateValues, cb);
    }
  ], checkResults(function() {
    // update failed, attempt an insert
    async.series([
      function(cb) {
        // make a savepoint
        stage = 'savepoint';
        tx.savepoint('upsert', cb);
      },
      function(cb) {
        // run insert
        savePointed = true;
        stage = 'insert';
        tx.query(insertQuery, insertValues, cb);
      }
    ], checkResults(function() {
      // insert failed; the session must have been created since the time that we failed the update
      async.series([
        function(cb) {
          // rollback to the savepoint
          stage = 'rollback';
          tx.rollback('upsert', cb);
        },
        function(cb) {
          // update again
          stage = 'update2';
          tx.query(updateQuery, updateValues, cb);
        }
      ], checkResults());
    }));
  }));
};

exports.schemas = {
  sessions:                  require('./schemas/sessions')
, charities:                 require('./schemas/charities')
, businesses:                require('./schemas/businesses')
, businessLoyaltySettings:   require('./schemas/businessLoyaltySettings')
, businessTags:              require('./schemas/businessTags')
, locations:                 require('./schemas/locations')
, users:                     require('./schemas/users')
, consumers:                 require('./schemas/consumers')
, managers:                  require('./schemas/managers')
, cashiers:                  require('./schemas/cashiers')
, tapinStations:             require('./schemas/tapinStations')
, groups:                    require('./schemas/groups')
, usersGroups:               require('./schemas/usersGroups')
, userLoyaltyStats:          require('./schemas/userLoyaltyStats')
, userRedemptions:           require('./schemas/userRedemptions')
, tapins:                    require('./schemas/tapins')
, visits:                    require('./schemas/visits')
, products:                  require('./schemas/products')
, productCategories:         require('./schemas/productCategories')
, productsProductCategories: require('./schemas/productsProductCategories')
, productLocations:          require('./schemas/productLocations')
, photos:                    require('./schemas/photos')
, productTags:               require('./schemas/productTags')
, productsProductTags:       require('./schemas/productsProductTags')
, productLikes:              require('./schemas/productLikes')
, productWants:              require('./schemas/productWants')
, productTries:              require('./schemas/productTries')
, oddityLive:                require('./schemas/oddityLive')
, oddityMeta:                require('./schemas/oddityMeta')
, events:                    require('./schemas/events')
};

exports.fields = fields;

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