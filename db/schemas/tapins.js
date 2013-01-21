/**
 * Consumers Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var consumers = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , userId: {
      type: 'int'
    , meta: 'references users'
    , validators: { isInt:[] }
    }
  , tapinStationId: {
      type: 'int'
    , meta: 'references tapinStations'
    , validators: { isInt:[] }
    }
  , cardId: {
      type: 'text'
    , validators: { len:[10, 12], is: /^\d{6,7}\-\w{3}$/ }
    , sanitizers: { trim:[] }
    }
  , dateTime: {
      type: 'timestamp'
    , meta: 'without time zone default now() not null'
    }
  };
  return consumers;
});