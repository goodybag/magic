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
  , consumerId: {
      type: 'int'
    , meta: 'references consumers'
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses'
    }
  , locationId: {
      type: 'int'
    , meta: 'references locations'
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