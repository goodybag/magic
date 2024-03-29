/**
 * businessLoyaltySettings Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var businessLoyaltySettings = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , reward: {
      type: 'text'
    , validators: { len:[1] }
    , sanitizers: { trim:[] }
    }
  , requiredItem: {
      type: 'text'
    , validators: { len:[1] }
    , sanitizers: { trim:[] }
    }
  , regularPunchesRequired: {
      type: 'int'
    , validators: { isInt:[] }
    }
  , elitePunchesRequired: {
      type: 'int'
    , validators: { isInt:[] }
    }
  , punchesRequiredToBecomeElite: {
      type: 'int'
    , validators: { isInt:[] }
    }
  , photoUrl: {
      type: 'text'
    , validators: { isUrl:[] }
    }
  };
  return businessLoyaltySettings;
});