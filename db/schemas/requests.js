/**
 * Requests schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var consumers = {
    uuid: {
      type: 'text'
    , meta: 'primary key'
    }
  , userId: {
      type: 'int'
    , validators: { isInt:[] }
    }
  , method: {
      type: 'text'
    , sanitizers: { trim:[] }
    }
  , url: {
      type: 'text'
    , sanitizers: { trim:[] }
    }
  , application: {
      type: 'text'
    , sanitizers: { trim:[] }
    }
  , userAgent: {
      type: 'text'
    , sanitizers: { trim:[] }
    }
  };
  return consumers;
});
