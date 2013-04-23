/**
 * Partial Registration schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var partialRegistration = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , userId: {
      type: 'int'
    , meta: 'references users(id) on delete cascade'
    }
  , token: {
      type: 'text'
    }
  , createdAt: {
      type: 'timestamp without time zone'
    }
  , used: {
      type: 'timestamp without time zone'
    }
  };
  return userPasswordReset;
});
