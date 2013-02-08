/**
 * Products Collections Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var productsCollections = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , productId: {
      type: 'int'
    , meta: 'references products(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , collectionId: {
      type: 'int'
    , meta: 'references collections(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , createdAt: {
      type: 'timestamp'
    }
  };
  return productsCollections;
});