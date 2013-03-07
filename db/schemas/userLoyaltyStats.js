/**
 * userLoyaltyStats Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var userLoyaltyStats = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , userId: {
      type: 'int'
    , meta: 'references users(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , numPunches: {
      type: 'int'
    , validators: { isInt:[] }
    }
  , totalPunches: {
      type: 'int'
    , validators: { isInt:[] }
    }
  , numRewards: {
      type: 'int'
    , validators: { isInt:[] }
    }
  , visitCount: {
      type: 'int'
    , validators: { isInt:[] }
    }
  , lastVisit: {
      type: 'timestamp'
    }
  , isElite: {
      type: 'boolean'
    }
  , dateBecameElite: {
      type: 'timestamp'
    }
  };
  return userLoyaltyStats;
});