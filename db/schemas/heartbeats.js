/**
 * Heartbeats Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  return {
    userId: {
      type: 'int'
    }
  , businessId: {
      type: 'int'
    }
  , locationId: {
      type: 'int'
    }
  , type: {
      type: 'text'
    }
  , createdAt: {
      type: 'timestamp'
    }
  , data: {
      type: 'text'
    }
  };
});