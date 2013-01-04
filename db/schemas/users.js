/**
 * Users Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var users = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , email: {
      type: 'text'
    }
  , password: {
      type: 'text'
    }
  , singlyAccessToken: {
      type: 'text'
    }
  , singlyId: {
      type: 'text'
    }
  };
  return users;
});