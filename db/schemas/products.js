/**
 * Products Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var products = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete cascade'
    , validators: { isInt: true }
    }
  , name: {
      type: 'text'
    , sanitizers: { trim: true }
    }
  , description: {
      type: 'text'
    }
  , price: {
      type: 'real'
    , validators: { isDecimal: true }
    }
  , isVerified: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    }
  , isArchived: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    }
  , isEnabled: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    }
  };
  return products;
});