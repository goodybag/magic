/**
 * Businesses Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var businesses = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , name: {
      type: 'text'
    , validators: { len:[1] }
    , sanitizers: { trim: true }
    }
  , url: {
      type: 'text'
    , validators: { isUrl: true }
    }
  , logoUrl: {
      type: 'text'
    , validators: { isUrl: true }
    }
  , cardCode: {
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
    , validators: { len: 2 }
    }
  , zip: {
      type: 'int'
    , validators: { len: 5 }
    }
  , isEnabled: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    }
  , createdAt: {
      type: 'timestamp'
    }
  , updatedAt: {
      type: 'timestamp'
    }
  };
  return businesses;
});