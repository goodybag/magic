/**
 * Import -
 * Will try and import all data from goodybag mongodb database into the
 * Goodybag postgres database. Assumes the postgres goodybag database is ready
 * to go.
 */

var
  mongo       = require('mongode')
, pg          = require('pg')
, db          = require('./index')
, config      = require('./config')

, mongoDB     = mongo.connect(config.mongoConnStr)

, onError = function(error, more){
    // Just throw for now
    console.log(error, more);
    throw error;
  }

, onComplete = function(){
    console.log('Finished');
    process.exit(0);
  }

, fields = {
    businesses: [
      'name'
    , 'url'
    , 'cardCode'
    ]
  }

, run = {
    consumers: function(client, callback){
      console.log("Consumers");
      mongoDB.consumers.find().toArray(function(error, consumers) {
        if (error) return onError(error);

        var next = function() {
          var consumer = consumers.pop();
          if (!consumer) return callback();

          var newConsumer = {
            email: consumer.email,
            password: consumer.password,
            firstName: consumer.firstName,
            lastName: consumer.lastName,
            cardId: consumer.barcodeId,
            screenName: consumer.screenName,
            createdAt: consumer.createdAt
          };
          console.log('.', newConsumer);

          db.procedures.registerConsumer(newConsumer, function(error, result) {
            if (error) return onError(error);

            if (consumer.gbAdmin) {
              // add to admin groups
              db.api.usersGroups.insert({ groupId:1, userId:result.id }, next);
            } else {
              next();
            }
          });
        };
        next();
      });
    }
  }
;

// Mongo Collections
mongoDB.consumers = mongoDB.collection('consumers');

module.exports = function(callback){
  console.log("Connecting to postgres database");
  pg.connect(config.postgresConnStr, function(error, client){
    console.log('...connected', error);
    if (error) return onError(error);

    // Setup batch
    var
      batch = []
    , cb = function() {
        if (batch.length === 0) onComplete();
        else batch.pop().call(undefined, client, cb);
      }
    ;

    for (var key in run){
      batch.push(run[key]);
    }

    // Kick off!
    batch.pop().call(undefined, client, cb);
  });
};

// Application behavior
// (when run from the command-line, exec)
if (require.main === module) {
  module.exports  ();
}