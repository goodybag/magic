/**
 * highlights Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  return {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }

  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete cascade'
    }

  , name: {
      type: 'text'
    }

  , order: {
      type: 'int'
    }

  , isEnabled: {
      type: 'boolean'
    }
  };
});
