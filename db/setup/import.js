/**
 * Import -
 * Will try and import all data from goodybag mongodb database into the
 * Goodybag postgres database. Assumes the postgres goodybag database is ready
 * to go.
 */

var
  mongo       = require('mongode')
, pg          = require('pg')
, config      = require('./config')

, db          = mongo.connect(config.mongoConnStr)

, onError = function(error){
    // Just throw for now
    throw error;
  }

, onComplete = function(){
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
    businesses: function(client, callback){
      console.log("Businesses");
      businesses.find({}, function(error, businesses){
        if (error) return onError(error);

        if (businesses.length === 0) return console.log("0 businesses");

        for (var i = businesses.length - 1, business, locations; i >= 0; i--){
          business = businesses[i];
          locations = business.locations;

          client.query({
            name: 'insert-business'
          , text: 'INSERT INTO businesses (' + fields.businesses.join(', ') + ')'
          })

          for (var i = locations.length - 1, location; i >= 0; i--){
            location = locations[i];

            client.query
          };
        }

        client.query('insert into businesses')
      });
    }
  }
;

// Collections
db.businesses = db.collection('businesses');

// Setup queries
client.query({
  name: 'insert-business'
, text: 'INSERT INTO businesses ('
        + fields.businesses.join(', ')
        + ') + ('
        + fields.businesses.map(function(a){ return "$" + i++; }).join(', ')
        + ')'
});

module.exports = function(callback){
  console.log("Connecting to postgres database");
  pg.connect(config.postgresConnStr, function(error, client){
    if (error) return onError(error);

    // Setup batch
    var
      batch = []
    , cb = function(){
        if (batch.length === 0) onComplete();
        else batch.pop().call({}, client);
      }
    ;

    for (var key in run){
      batch.push(run[key]);
    }

    // Kick off!
    batch.pop().call({}, client);
  });
};