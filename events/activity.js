/**
 * Listeners for all the activity that we want to store in the log
 */

var
  db      = require('../db')
, utils   = require('../lib/utils')
, sql     = require('../lib/sql')
, magic   = require('../lib/magic')

, logger  = require('../lib/logger')({ app: 'api', component: 'activity' })

, TAGS = ['events', 'activity']
;

module.exports = {
  'products.like':
  function (userId, productId){
    var
      inputs = {}
    , TAGS = ['activity-products-like-event']

    , tasks = {
        lookupConsumer: function(done){
          var options = { fields: ['"screenName"', 'id'] };
          db.api.consumers.setLogTags(TAGS);
          db.api.consumers.findOne({ id: userId }, options, function(e, r, m){
            return done(e, r);
          });
        }

      , lookupProduct: function(done){
          var options = { fields: ['name', '"businessId"'] };
          db.api.products.setLogTags(TAGS);
          db.api.products.findOne(productId, options, function(e, r, m){
            return done(e, r);
          });
        }

      , complete: function(error, results){
          if (error) return logger.error(TAGS, error);
          if (!results.consumer || !results.product)
            return logger.error(TAGS, "Failed to store like event");

          var options = { fields: ['name'] };
          db.api.businesses.setLogTags(TAGS);
          db.api.businesses.findOne(results.product.businessId, options, function(error, business){
            if (error) return logger.error(TAGS, error);

            db.api.activity.setLogTags(TAGS);
            db.api.activity.insert({
              type:       'like'
            , date:       'now()'
            , userId:     userId
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
    , TAGS = ['activity-products-want-event']

    , tasks = {
        lookupConsumer: function(done){
          var options = { fields: ['"screenName"', 'id'] };
          db.api.consumers.setLogTags(TAGS);
          db.api.consumers.findOne({ id: userId }, options, function(e, r, m){
            return done(e, r);
          });
        }

      , lookupProduct: function(done){
          var options = { fields: ['name', '"businessId"'] };
          db.api.products.setLogTags(TAGS);
          db.api.products.findOne(productId, options, function(e, r, m){
            return done(e, r);
          });
        }

      , complete: function(error, results){
          if (error) return logger.error(TAGS, error);
          if (!results.consumer || !results.product)
            return logger.error(TAGS, "Failed to store want event");

          var options = { fields: ['name'] };
          db.api.businesses.setLogTags(TAGS);
          db.api.businesses.findOne(results.product.businessId, options, function(error, business){
            if (error) return logger.error(TAGS, error);

            db.api.activity.setLogTags(TAGS);
            db.api.activity.insert({
              type:       'want'
            , date:       'now()'
            , userId:     userId
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
          db.api.consumers.setLogTags(TAGS);
          db.api.consumers.findOne({ id: userId }, options, function(e, r, m){
            return done(e, r);
          });
        }

      , lookupProduct: function(done){
          var options = { fields: ['name', '"businessId"'] };
          db.api.products.setLogTags(TAGS);
          db.api.products.findOne(productId, options, function(e, r, m){
            return done(e, r);
          });
        }

      , complete: function(error, results){
          if (error) return logger.error(TAGS, error);
          if (!results.consumer || !results.product)
            return logger.error(TAGS, "Failed to store try event");

          var options = { fields: ['name'] };
          db.api.businesses.setLogTags(TAGS);
          db.api.businesses.findOne(results.product.businessId, options, function(error, business){
            if (error) return logger.error(TAGS, error);

            db.api.activity.setLogTags(TAGS);
            db.api.activity.insert({
              type:       'try'
            , date:       'now()'
            , userId:     userId
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
  function (userId, businessId, locationId){
    var
      TAGS = ['activity-consumers-becameElite-event']
    , stage = {
        start: function(){
          stage.lookUpUserAndBusiness();
        }

      , lookUpUserAndBusiness: function(){
          utils.parallel({
            consumer: function(done){
              var options = { fields: ['"screenName"'] };
              db.api.consumers.setLogTags(TAGS);
              db.api.consumers.findOne({ id:userId }, options, function(e, r, m){
                return done(e, r);
              });
            }
          , business: function(done){
              var options = { fields: ['name'] };
              db.api.businesses.setLogTags(TAGS);
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
          , userId:     userId
          , businessId: businessId
          , locationId: locationId

          , data: JSON.stringify({
              consumerScreenName: screenName
            , businessName:       businessName
            })
          };

          db.api.activity.setLogTags(TAGS);
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

, 'loyalty.punch':
  function (deltaPunches, userId, businessId, locationId, employeeId){
    var
      TAGS = ['activity-loyalty-punch-event']
    , stage = {
        start: function(){
          stage.lookUpUserAndBusiness();
        }

      , lookUpUserAndBusiness: function(){
          utils.parallel({
            consumer: function(done){
              var options = { fields: ['"screenName"'] };
              db.api.consumers.setLogTags(TAGS);
              db.api.consumers.findOne({ id:userId }, options, function(e, r, m){
                return done(e, r);
              });
            }
          , business: function(done){
              var options = { fields: ['name'] };
              db.api.businesses.setLogTags(TAGS);
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
            type:       'punch'
          , date:       'now()'
          , userId:     userId
          , businessId: businessId
          , locationId: locationId

          , data: JSON.stringify({
              consumerScreenName: screenName
            , businessName:       businessName
            , employeeId:         employeeId
            , deltaPunches:       deltaPunches
            })
          };

          db.api.activity.setLogTags(TAGS);
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

, 'loyalty.redemption':
  function (deltaPunches, userId, businessId, locationId, employeeId){
    var
      TAGS = ['activity-loyalty-redemption-event']
    , stage = {
        start: function(){
          stage.lookUpUserAndBusiness();
        }

      , lookUpUserAndBusiness: function(){
          utils.parallel({
            consumer: function(done){
              var options = { fields: ['"screenName"'] };
              db.api.consumers.setLogTags(TAGS);
              db.api.consumers.findOne({ id:userId }, options, function(e, r, m){
                return done(e, r);
              });
            }
          , business: function(done){
              var options = { fields: ['name'] };
              db.api.businesses.setLogTags(TAGS);
              db.api.businesses.findOne(businessId, options, function(e, r, m){
                return done(e, r);
              });
            }
          , loyaltySettings: function(done){
              var options = { fields: ['reward'] };
              db.api.businessLoyaltySettings.setLogTags(TAGS);
              db.api.businessLoyaltySettings.findOne({ businessId: businessId }, options, function(e, r, m){
                return done(e, r);
              });
            }
          }, function(error, results){
            if (error) return stage.error(error);
            if (!results.consumer) return stage.error("Consumer not found!");
            if (!results.business) return stage.error("Business not found!");
            if (!results.loyaltySettings) return stage.error("Loyalty Settings not found!");

            stage.saveEvent(
              results.consumer.screenName
            , results.business.name
            , results.loyaltySettings.reward
            );
          });
        }

      , saveEvent: function(screenName, businessName, reward){
          var data = {
            type:       'redemption'
          , date:       'now()'
          , userId:     userId
          , businessId: businessId
          , locationId: locationId

          , data: JSON.stringify({
              consumerScreenName: screenName
            , businessName:       businessName
            , employeeId:         employeeId
            , deltaPunches:       deltaPunches
            , reward:             reward
            })
          };

          db.api.activity.setLogTags(TAGS);
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