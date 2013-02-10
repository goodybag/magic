/**
 * Listeners for all the activity that we want to broadcast
 */

var
  db      = require('../db')
, utils   = require('../lib/utils')
, sql     = require('../lib/sql')
, pubnub  = require('../lib/pubnub')

, logger  = require('../lib/logger')({ app: 'api', component: 'pubnub' })

, TAGS = ['events', 'pubnub']
;


module.exports = {
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
};

function logErrors(response) {
  if (response[0] !== 1) {
    logger.error(TAGS, { error:'Failed to publish pubnub event', response:response });
  }
}