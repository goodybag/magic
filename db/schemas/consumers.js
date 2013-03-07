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
      type: 'int'
    , meta: 'primary key references users(id) on delete cascade'
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
  , avatarUrl: {
      type: 'text'
    , validators: { isUrl:[] }
    }
  };
  return consumers;
});