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
    , validators: { isInt:[], notNull:[] }
    }
  , tag: {
      type: 'text'
    , validators: { len:[1], notNull:[] }
    }
  , createdAt: {
      type: 'timestamp'
    }
  };
  return productTags;
});