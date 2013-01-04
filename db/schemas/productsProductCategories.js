/**
 * Products <-> ProductCategories Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var productsProductCategories = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , productId: {
      type: 'int'
    , meta: 'references products(id) on delete cascade'
    , validators: { isInt: true }
    }
  , productCategoryId: {
      type: 'int'
    , meta: 'references "productCategories"(id) on delete cascade'
    , validators: { isInt: true }
    }
  };
  return productsProductCategories;
});