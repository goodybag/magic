/**
 * Oddity Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var oddityLive = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
    , name: {
      type: 'text'
    }
    , url: {
      type: 'text'
    }
    , street1: {
      type: 'text'
    }
    , street2: {
      type: 'text'
    }
    , city: {
      type: 'text'
    }
    , state: {
      type: 'text'
    }
    , zip: {
      type: 'int'
    }
    , createdAt: {
      type: 'timestamp'
    }
    , updatedAt: {
      type: 'timestamp'
    }
  };
  return oddityLive;
});