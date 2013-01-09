/**
 * Products <-> Product Tags Relation Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var productsProductTags = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , productTagId: {
      type: 'int'
    , meta: 'references "productTags"(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , productId: {
      type: 'int'
    , meta: 'references products(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , createdAt: {
      type: 'timestamp'
    }
  };
  return productsProductTags;
});