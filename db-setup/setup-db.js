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

    console.log("make sure it runs")
var
  fs      = require('fs')
, pg      = require('pg')
, config  = require('./config')

, queries = {}

, files   = config.schemaFiles

, onComplete = function(client, callback){
    client.end();
    callback(null, queries);
  }

, getSql = function(file, callback){
    fs.readFile('./schemas/' + file + '.sql', 'utf-8', function(error, data){
      if (error) return callback(error);

      queries[file] = data;

      return callback(null, data);
    });
  }
;
console.log("call function")

module.exports = function(callback){

  console.log("Setting up Goodybag Postgres");

  console.log("Connecting to Postgres database");
  pg.connect(config.postgresConnStr, function(error, client){
    if (error) return callback(error);

    // Setup a batch for serial execution
    var
      batch = []
    , getFn = function(name){
        return function(){
          console.log("Dropping Sequence for " + name);
          var query = client.query("drop sequence if exists " + name + "_id_seq cascade");

          query.on('end', function(){
            console.log("Dropping " + name);
            var query = client.query("drop table if exists " + name + " cascade");

            query.on('end', function(){
              console.log("Creating " + name);

              getSql(name, function(error, file){
                if (error)
                    return callback(error);

                console.log(file);
                var query = client.query(file);

                query.on('end', function(){
                  if (batch.length === 0) return onComplete(client, callback);
                  else batch.pop().call();
                });
              });
            });
          });
        }
      }
    ;

    // go through each file and execte create table query
    for (var i = files.length - 1; i >= 0; i--){
        console.log("Read file");
      batch.push(getFn(files[i]));
    }

    // Kick off the batch
      console.log("pop file");
    batch.pop().call();
  });
};