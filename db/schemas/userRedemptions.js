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
    , meta: 'references businesses(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , userId: {
      type: 'int'
    , meta: 'references users(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , cashierUserId: {
      type: 'int'
    , meta: 'references users(id) on delete set null'
    , validators: { isInt:[] }
    }
  , locationId: {
      type: 'int'
    , meta: 'references locations(id) on delete set null'
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