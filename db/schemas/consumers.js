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
    , meta: 'references users on delete cascade'
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
  };
  return consumers;
});