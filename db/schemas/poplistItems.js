/**
 * PoplistItems Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var poplistItems = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    , validators: { isInt:[] }
    }
  , listid: {
      type: 'int'
    , validators: { isInt:[] }
    }
  , productId: {
      type: 'int'
    , meta: 'references products(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , createdAt: {
      type: 'timestamp'
    , meta: 'default now()'
    }
  , isActive: {
      type: 'bool'
    , validators: { isBool:[] }
    }
  };
  return poplistItems;
});