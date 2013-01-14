/**
 * Product Wants Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var productWants = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , productId: {
      type: 'int'
    , meta: 'references products(id)'
    , validators: { isInt:[] }
    }
  , userId: {
      type: 'int'
    , meta: 'references "users"(id)'
    , validators: { isInt:[] }
    }
  , createdAt: {
      type: 'timestamp'
    }
  };
  return productWants;
});