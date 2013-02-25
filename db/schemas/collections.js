/**
 * Collections Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var collections = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , pseudoKey: {
      type: 'text'
    }
  , userId: {
      type: 'int'
    , meta: 'references users(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , name: {
      type: 'text'
    , sanitizers: { trim:[] }
    }
  , isHidden: {
      type: 'bool'
    }
  };
  return collections;
});