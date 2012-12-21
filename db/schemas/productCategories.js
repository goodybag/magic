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
    }
  , order: {
      type: 'int'
    }
  , isFeatured: {
      type: 'boolean'
    }
  , name: {
      type: 'text'
    , sanitizers: { trim: true }
    }
  };
  return productCategories;
});