/**
 * userRedemptions Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var userRedemptions = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses'
    , validators: { isInt:[] }
    }
  , consumerId: {
      type: 'int'
    , meta: 'references consumers'
    , validators: { isInt:[] }
    }
  , cashierUserId: {
      type: 'int'
    , meta: 'references users'
    , validators: { isInt:[] }
    }
  , locationId: {
      type: 'int'
    , meta: 'references locations'
    , validators: { isInt:[] }
    }
  , tapinStationId: {
      type: 'int'
    // , meta: 'references tapinStations'
    , validators: { isInt:[] }
    }
  , dateTime: {
      type: 'timestamp'
    }
  };
  return userRedemptions;
});