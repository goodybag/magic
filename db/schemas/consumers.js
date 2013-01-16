/**
 * Consumers Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var consumers = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , userId: {
      type: 'int'
    }
  , firstName: {
      type: 'text'
    }
  , lastName: {
      type: 'text'
    }
  , screenName: {
      type: 'text'
    }
  , tapinId: {
      type: 'text'
    }
  };
  return consumers;
});