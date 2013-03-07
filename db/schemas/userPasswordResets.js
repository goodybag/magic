/**
 * Password Reset Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var userPasswordReset = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , userId: {
      type: 'int'
    , meta: 'references users(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , token: {
      type: 'text'
    }
  , expires: {
      type: 'timestamp'
    }
  , createdAt: {
      type: 'timestamp'
    }
  };
  return userPasswordReset;
});