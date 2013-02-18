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
  , userId: {
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
  , date: {
      type: 'timestamp'
    }
  , data: {
      type: 'text'
    }
  };
  return users;
});