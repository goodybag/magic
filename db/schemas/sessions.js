/**
 * Sessions Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var sessions = {
    id: {
      type: 'text'
    }
  , data: {
      type: 'text'
    }
  , expiration: {
      type: 'timestamp'
    }
  };
  return sessions;
});