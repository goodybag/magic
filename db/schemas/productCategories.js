/**
 * Product Categories Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var productCategories = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , order: {
      type: 'int'
    , validators: { isInt:[] }
    }
  , isFeatured: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
    }
  , name: {
      type: 'text'
    , validators: { len:[1] }
    , sanitizers: { trim:[] }
    }
  , description: {
      type: 'text'
    , sanitizers: { trim:[] }
    }
  };
  return productCategories;
});