/**
 * Listeners for all the activity that we want to broadcast
 */

var
  db      = require('../db')
, utils   = require('../lib/utils')
, sql     = require('../lib/sql')
, pubnub  = require('../lib/pubnub')
, api     = require('../lib/api')

, logger  = require('../lib/logger')({ app: 'api', component: 'pubnub' })

, TAGS = ['events', 'pubnub']
;


module.exports = {

// Products
// ========

  'products.like':
  function (userId, productId){
    pubnub.publish({
        channel:'products.like',
        message:{ userId:userId, productId:productId },
        callback:logErrors
    });
  }

, 'products.want':
  function (userId, productId){
    pubnub.publish({
        channel:'products.want',
        message:{ userId:userId, productId:productId },
        callback:logErrors
    });
  }

, 'products.try':
  function (userId, productId){
    pubnub.publish({
        channel:'products.try',
        message:{ userId:userId, productId:productId },
        callback:logErrors
    });
  }

, 'products.create':
  function (product){
    pubnub.publish({
        channel:'business-' + product.businessId + '.productCreate',
        message:{ productId:product.id, product:product },
        callback:logErrors
    });
  }

, 'products.update':
  function (productId, updates){
    db.api.products.findOne(productId, { fields: ['"businessId"'] }, function(err, product){
      if (err) return logger.error(['pubnub-products-update'], err);
      pubnub.publish({
          channel:'business-' + product.businessId + '.productUpdate',
          message:{ productId:productId, updates:updates },
          callback:logErrors
      });
    });
  }

// Loyalty
// =======

, 'loyalty.settingsUpdate':
  function (businessId, updates){
    pubnub.publish({
        channel:'business-' + businessId + '.loyaltySettingsUpdate',
        message:{ updates:updates },
        callback:logErrors
    });
  }

// Businesses
// ==========

, 'businesses.update':
  function (businessId, updates){
    pubnub.publish({
        channel:'business-' + businessId + '.update',
        message:{ updates:updates },
        callback:logErrors
    });
  }

, 'businesses.logoUpdate':
  function (businessId, logoUrl){
    pubnub.publish({
        channel:'business-' + businessId + '.logoUpdate',
        message:{ logoUrl:logoUrl },
        callback:logErrors
    });
  }

// Locations
// =========

, 'locations.productStockUpdate':
  function (locationId, productId, isAvailable){
    pubnub.publish({
        channel:'location-' + locationId + '.productStockUpdate',
        message:{ productId:+productId, isAvailable:!!isAvailable },
        callback:logErrors
    });
  }

, 'locations.productSpotlightUpdate':
  function (locationId, productId, inSpotlight){
    pubnub.publish({
        channel:'location-' + locationId + '.productSpotlightUpdate',
        message:{ productId:+productId, inSpotlight:!!inSpotlight },
        callback:logErrors
    });
  }

// Tapin Stations
// ==============

, 'tapinstations.update':
  function (tapinStationId, updates){
    pubnub.publish({
        channel:'tapinstation-' + tapinStationId + '.update',
        message:{ updates:updates },
        callback:logErrors
    });
  }

};

function logErrors(response) {
  if (response[0] !== 1) {
    logger.error(['pubnub-publish'], { error:'Failed to publish pubnub event', response:response });
  }
}