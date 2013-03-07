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
  , charityId: {
      type: 'int'
    , meta: 'references charities(id) on delete set null'
    , validators: { isInt:[] }
    }
  , name: {
      type: 'text'
    , validators: { notNull:[], notEmpty:[] }
    , sanitizers: { trim:[] }
    }
  , url: {
      type: 'text'
    , validators: { isUrl:[] }
    }
  , logoUrl: {
      type: 'text'
    , validators: { isUrl:[] }
    }
  , cardCode: {
      type: 'text'
    }
  , menuDescription: {
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
    , validators: { len:2, isAlpha:[] }
    }
  , zip: {
      type: 'int'
    , validators: { len:5, isInt:[] }
    }
  , isGB: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
    }
  , isVerified: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
    }
  , isEnabled: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
    }
  , isDeleted: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
    }
  , isFlagged: {
      type: 'boolean'
    , validators: {is: /true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
    }
  , comment: {
      type: 'text'
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
