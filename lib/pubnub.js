/**
 * PubNub API instance
 */

var
  config  = require('../config')
, PUBNUB  = require('pubnub')
;

var pubnub = PUBNUB.init({
  publish_key: config.pubnub.publish_key,
  subscribe_key: config.pubnub.subscribe_key
});

module.exports = pubnub;