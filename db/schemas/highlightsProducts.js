/**
 * menuSectionsProducts Schema
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

  , highlightId: {
      type: 'int'
    , meta: 'references highlights(id) on delete cascade'
    }

  , productId: {
      type: 'int'
    , meta: 'references products(id) on delete cascade'
    }

  , locationId: {
      type: 'int'
    , meta: 'references locations(id) on delete cascade'
    }

  , order: {
      type: 'int'
    }
  };
});
