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
    userId: {
      type: 'int'
    , meta: 'primary key references users on delete cascade'
    , validators: { isInt:[] }
    }
  , firstName: {
      type: 'text'
    , validators: { len:[1] }
    , sanitizers: { trim:[] }
    }
  , lastName: {
      type: 'text'
    , validators: { len:[1] }
    , sanitizers: { trim:[] }
    }
  , screenName: {
      type: 'text'
    , validators: { len:[1] }
    , sanitizers: { trim:[] }
    }
  , cardId: {
      type: 'text'
    , validators: { len:[10, 12], is: /^\d{6,7}-\w{3}$/ }
    , sanitizers: { trim:[] }
    }
  };
  return consumers;
});