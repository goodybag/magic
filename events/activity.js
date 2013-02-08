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
          var options = { fields: ['"screenName"', 'id'] };
          db.api.consumers.findOne({ userId: userId }, options, function(e, r, m){
            return done(e, r);
          });
        }

      , lookupProduct: function(done){
          var options = { fields: ['name', '"businessId"'] };
          db.api.products.findOne(productId, options, function(e, r, m){
            return done(e, r);
          });
        }

      , complete: function(error, results){
          if (error) return logger.error(TAGS, error);
          if (!results.consumer || !results.product)
            return logger.error(TAGS, "Failed to store like event");

          var options = { fields: ['name'] };
          db.api.businesses.findOne(results.product.businessId, options, function(error, business){
            if (error) return logger.error(TAGS, error);

            db.api.activity.insert({
              type:       'like'
            , date:       'now()'
            , consumerId: results.consumer.id
            , businessId: results.product.businessId

            , data: JSON.stringify({
                productId:          productId
              , productName:        results.product.name
              , consumerScreenName: results.consumer.screenName
              , businessName:       business.name
              })
            }, function(error, result){
              if (error)    return logger.error(TAGS, error);
              if (!result)  return logger.error(TAGS, "Failed to store like event");
            });
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
          var options = { fields: ['"screenName"', 'id'] };
          db.api.consumers.findOne({ userId: userId }, options, function(e, r, m){
            return done(e, r);
          });
        }

      , lookupProduct: function(done){
          var options = { fields: ['name', '"businessId"'] };
          db.api.products.findOne(productId, options, function(e, r, m){
            return done(e, r);
          });
        }

      , complete: function(error, results){
          if (error) return logger.error(TAGS, error);
          if (!results.consumer || !results.product)
            return logger.error(TAGS, "Failed to store want event");

          var options = { fields: ['name'] };
          db.api.businesses.findOne(results.product.businessId, options, function(error, business){
            if (error) return logger.error(TAGS, error);

            db.api.activity.insert({
              type:       'want'
            , date:       'now()'
            , consumerId: results.consumer.id
            , businessId: results.product.businessId

            , data: JSON.stringify({
                productId:          productId
              , productName:        results.product.name
              , consumerScreenName: results.consumer.screenName
              , businessName:       business.name
              })
            }, function(error, result){
              if (error)    return logger.error(TAGS, error);
              if (!result)  return logger.error(TAGS, "Failed to store want event");
            });
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
          var options = { fields: ['"screenName"', 'id'] };
          db.api.consumers.findOne({ userId: userId }, options, function(e, r, m){
            return done(e, r);
          });
        }

      , lookupProduct: function(done){
          var options = { fields: ['name', '"businessId"'] };
          db.api.products.findOne(productId, options, function(e, r, m){
            return done(e, r);
          });
        }

      , complete: function(error, results){
          if (error) return logger.error(TAGS, error);
          if (!results.consumer || !results.product)
            return logger.error(TAGS, "Failed to store try event");

          var options = { fields: ['name'] };
          db.api.businesses.findOne(results.product.businessId, options, function(error, business){
            if (error) return logger.error(TAGS, error);

            db.api.activity.insert({
              type:       'try'
            , date:       'now()'
            , consumerId: results.consumer.id
            , businessId: results.product.businessId

            , data: JSON.stringify({
                productId:          productId
              , productName:        results.product.name
              , consumerScreenName: results.consumer.screenName
              , businessName:       business.name
              })
            }, function(error, result){
              if (error)    return logger.error(TAGS, error);
              if (!result)  return logger.error(TAGS, "Failed to store try event");
            });
          });
        }
      }
    ;

    utils.parallel({
      consumer:  tasks.lookupConsumer
    , product:   tasks.lookupProduct
    }, tasks.complete);
  }

, 'consumers.becameElite':
  function (consumerId, businessId){
    var
      stage = {
        start: function(){
          stage.lookUpUserAndBusiness();
        }

      , lookUpUserAndBusiness: function(){
          utils.parallel({
            consumer: function(done){
              var options = { fields: ['"screenName"'] };
              db.api.consumers.findOne(consumerId, options, function(e, r, m){
                return done(e, r);
              });
            }
          , business: function(done){
              var options = { fields: ['name'] };
              db.api.businesses.findOne(businessId, options, function(e, r, m){
                return done(e, r);
              });
            }
          }, function(error, results){
            if (error) return stage.error(error);
            if (!results.consumer) return stage.error("Consumer not found!");
            if (!results.business) return stage.error("Business not found!");

            stage.saveEvent(results.consumer.screenName, results.business.name);
          });
        }

      , saveEvent: function(screenName, businessName){
          var data = {
            type:       'becameElite'
          , date:       'now()'
          , consumerId: consumerId
          , businessId: businessId

          , data: JSON.stringify({
              consumerScreenName: screenName
            , businessName:       businessName
            })
          };

          db.api.activity.insert(data, function(error){
            if (error) return stage.error(error);
            return stage.end();
          });
        }

      , error: function(error){
          return logger.error(TAGS, error);
        }

      , end: function(){
          // yay!
        }
      }
    ;

    stage.start();
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