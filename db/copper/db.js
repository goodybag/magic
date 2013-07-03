var _
, pg        = require('pg')
, config    = require('../../config')
, DbApi     = require('../../lib/api')

, tables = [
    'requests'
  ]
;

var client = {
  query: function(query, values, callback){
    if (typeof values == 'function'){
      callback = values;
      values = [];
    }
console.log("Copper: ", config.copper.connStr);
    pg.connect( config.copper.connStr, function(error, client, done){
      if (error) return callback ? callback(error) : null;

      client.query( query, values, function(error, result){
        done();

        if (error) return callback ? callback(error) : null;

        if (callback) callback(null, result);
      });
    });
  }
};

// Instantiate db apis for each table, initially setting client to null
for (var i = 0, l = tables.length; i < l; ++i){
  module.exports[ tables[i] ] = new DbApi( client, tables[i] );
}

module.exports.query = client.query;
module.exports.tables = tables;