/**
 * Product Tags Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var productTags = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete cascade'
    }
  , productId: {
      type: 'int'
    , meta: 'references products(id) on delete cascade'
    }
  , tag: {
      type: 'text'
    }
  , createdAt: {
      type: 'timestamp'
    }
  };
  return productTags;
});