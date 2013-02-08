/**
 * Listeners for all the activity that we want to store in the log
 */

var
  db      = require('../db')
, utils   = require('../lib/utils')
, sql     = require('../lib/sql')

, logger  = require('../lib/logger')({ app: 'api', component: 'activity' })

, insert = function(type, inputs, data, callback){
    var TAGS = ['store-activity', type];

    callback = callback || utils.noop;

    db.getClient(function(error, client){
      if (error) return logger.error(TAGS, error);

      var query = sql.query('insert into activity ({fields}) values ({values})');
      query.fields = sql.fields().addObjectKeys(inputs);
      query.values = sql.fields().addObjectValues(inputs, query);

      query.fields.add('"date"');
      query.values.add('now()');

      query.fields.add('"data"');
      query.values.add(sql.hstoreValue(data));

      client.query(query.toString(), query.$values, function(error){
        if (error) return logger.error(TAGS, error);

        callback();
      });
    });
  }

, api = {
    consumers: {
      findOne: function(where, callback){
        db.getClient(function(error, client){
          if (error) return callback(error);

          if (typeof where !== "object") where = { id: where };

          var query = sql.query('select * from consumers {where}');
          var values = [], keys = [];

          for (var key in where){

          }


          client.query(query, values, function(error, result){
            if (error) callback(error);

            callback(null, result.rows.length > 0 ? result.rows[0] : null);
          });
        });
      }
    }
  }
;

module.exports = {
  'products.like':
  function (userId, productId){
    var
      inputs = {
        consumerId:   consumerId
      , businessId:   businessId
      , locationId:   locationId
      }
    , data = {
        deltaPunches: deltaPunches
      }
    ;

    // Look up user
    api.consumers.findOne(consumerId, function(error, consumer){
      if (error) return logger.error(TAGS, error);

      data.consumerScreenName = consumer.screenName;

      insert('loyalty.punch', inputs, data);
    });
  }

, 'products.try':
  function (userId, productId){
    insert('products.try', { userId: userId, productId: productId });
  }

, 'products.want':
  function (userId, productId){
    insert('products.want', { userId: userId, productId: productId });
  }

// Don't do this yet
// , 'loyalty.punch':
//   function (deltaPunches, consumerId, businessId, locationId, employeeId){
//     var
//       inputs = {
//         consumerId:   consumerId
//       , businessId:   businessId
//       , locationId:   locationId
//       }
//     , data = {
//         deltaPunches: deltaPunches
//       }
//     ;

//     // Look up user
//     api.consumers.findOne(consumerId, function(error, consumer){
//       if (error) return logger.error(TAGS, error);

//       data.consumerScreenName = consumer.screenName;

//       insert('loyalty.punch', inputs, data);
//     });
//   }
};