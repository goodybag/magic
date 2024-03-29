/**
 * Products Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var products = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , name: {
      type: 'text'
    , validators: { len:[1] }
    , sanitizers: { trim:[] }
    }
  , description: {
      type: 'text'
    }
  , price: {
      type: 'int'
    , validators: { isInt:[] }
    , sanitizers: { ifNull:[0] }
    }
  , photoUrl: {
      type: 'text'
    , validators: { isUrl:[] }
    }
  , likes: {
      type: 'int'
    }
  , wants: {
      type: 'int'
    }
  , tries: {
      type: 'int'
    }
  , isVerified: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
    }
  , isArchived: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
    }
  , isEnabled: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
    }
  };
  return products;
});