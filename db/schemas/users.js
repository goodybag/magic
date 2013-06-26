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
  , passwordSalt: {
      type: 'text'
    }
  , singlyAccessToken: {
      type: 'text'
    }
  , singlyId: {
      type: 'text'
    }
  , cardId: {
      type: 'text'
    , validators: { len:[10, 12], is: /^\d{6,7}\-\w{3}$/ }
    , sanitizers: { trim:[] }
    }
  , phone: {
      type: 'text'
    , validators: {is: '\d{10}(ex\d{4})?'}
    , sanitizers: { trim:[] }
    }
  , createdAt: {
      type: 'timestamp'
    }
  };
  return users;
});
