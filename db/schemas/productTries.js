/**
 * Product Tries Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var productTries = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , productId: {
      type: 'int'
    , meta: 'references products(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , userId: {
      type: 'int'
    , meta: 'references "users"(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , createdAt: {
      type: 'timestamp'
    }
  };
  return productTries;
});