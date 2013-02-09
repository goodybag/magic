/**
 * Consumer Card Update Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var consumerCardUpdates = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , consumerId: {
      type: 'int'
    , meta: 'references consumers on delete cascade'
    , validators: { isInt:[] }
    }
  , newCardId: {
      type: 'text'
    , validators: { len:[10, 12], is: /^\d{6,7}\-\w{3}$/ }
    , sanitizers: { trim:[] }
    }
  , oldCardId: {
      type: 'text'
    , validators: { len:[10, 12], is: /^\d{6,7}\-\w{3}$/ }
    , sanitizers: { trim:[] }
    }
  , token: {
      type: 'text'
    }
  , expires: {
      type: 'timestamp'
    }
  , createdAt: {
      type: 'timestamp'
    }
  };
  return consumerCardUpdates;
});