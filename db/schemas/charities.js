/**
 * Charities Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var charities = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , name: {
      type: 'text'
    , validators: { len:[1] }
    , sanitizers: { trim:[] }
    }
  , desc: {
      type: 'text'
    }
  , logoUrl: {
      type: 'text'
    , validators: { isUrl:[] }
    }
  , joinedDate: {
      type: 'timestamp'
    }
  , totalReceived: {
      type: 'real'
    , validators: { isFloat:[] }
    }
  };
  return charities;
});