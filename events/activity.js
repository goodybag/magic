/**
 * Listeners for all the activity that we want to store in the log
 */

var
  db      = require('../db')
, utils   = require('../lib/utils')
, sql     = require('../lib/sql')

, logger  = require('../lib/logger')({ app: 'api', component: 'activity' })

, TAGS = ['events', 'activity']
;

module.exports = {
  'products.like':
  function (userId, productId){
    var
      inputs = {}

    , tasks = {
        lookupConsumer: function(done){
          db.api.consumers.findOne({ userId: userId }, { fields: ['"screenName"', 'id'] }, function(e, r, m){
            return done(e, r);
          });
        }

      , lookupProduct: function(done){
          db.api.products.findOne(productId, { fields: ['name', '"businessId"'] }, function(e, r, m){
            return done(e, r);
          });
        }

      , complete: function(error, results){
          if (error) return logger.error(TAGS, error);
          if (!results.consumer || !results.product)
            return logger.error(TAGS, "Failed to store like event");

          db.api.activity.insert({
            type:       'like'
          , date:       'now()'
          , consumerId: results.consumer.id
          , businessId: results.product.businessId

          , data: JSON.stringify({
              productId:          productId
            , productName:        results.product.name
            , consumerScreenName: results.consumer.screenName
            })
          }, function(error, result){
            if (error)    return logger.error(TAGS, error);
            if (!result)  return logger.error(TAGS, "Failed to store like event");
          });
        }
      }
    ;

    utils.parallel({
      consumer:  tasks.lookupConsumer
    , product:   tasks.lookupProduct
    }, tasks.complete);
  }

, 'products.want':
  function (userId, productId){
    var
      inputs = {}

    , tasks = {
        lookupConsumer: function(done){
          db.api.consumers.findOne({ userId: userId }, { fields: ['"screenName"', 'id'] }, function(e, r, m){
            return done(e, r);
          });
        }

      , lookupProduct: function(done){
          db.api.products.findOne(productId, { fields: ['name', '"businessId"'] }, function(e, r, m){
            return done(e, r);
          });
        }

      , complete: function(error, results){
          if (error) return logger.error(TAGS, error);
          if (!results.consumer || !results.product)
            return logger.error(TAGS, "Failed to store want event");

          db.api.activity.insert({
            type:       'want'
          , date:       'now()'
          , consumerId: results.consumer.id
          , businessId: results.product.businessId

          , data: JSON.stringify({
              productId:          productId
            , productName:        results.product.name
            , consumerScreenName: results.consumer.screenName
            })
          }, function(error, result){
            if (error)    return logger.error(TAGS, error);
            if (!result)  return logger.error(TAGS, "Failed to store want event");
          });
        }
      }
    ;

    utils.parallel({
      consumer:  tasks.lookupConsumer
    , product:   tasks.lookupProduct
    }, tasks.complete);
  }

, 'products.try':
  function (userId, productId){
    var
      inputs = {}

    , tasks = {
        lookupConsumer: function(done){
          db.api.consumers.findOne({ userId: userId }, { fields: ['"screenName"', 'id'] }, function(e, r, m){
            return done(e, r);
          });
        }

      , lookupProduct: function(done){
          db.api.products.findOne(productId, { fields: ['name', '"businessId"'] }, function(e, r, m){
            return done(e, r);
          });
        }

      , complete: function(error, results){
          if (error) return logger.error(TAGS, error);
          if (!results.consumer || !results.product)
            return logger.error(TAGS, "Failed to store try event");

          db.api.activity.insert({
            type:       'try'
          , date:       'now()'
          , consumerId: results.consumer.id
          , businessId: results.product.businessId

          , data: JSON.stringify({
              productId:          productId
            , productName:        results.product.name
            , consumerScreenName: results.consumer.screenName
            })
          }, function(error, result){
            if (error)    return logger.error(TAGS, error);
            if (!result)  return logger.error(TAGS, "Failed to store try event");
          });
        }
      }
    ;

    utils.parallel({
      consumer:  tasks.lookupConsumer
    , product:   tasks.lookupProduct
    }, tasks.complete);
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