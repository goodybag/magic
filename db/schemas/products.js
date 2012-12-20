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
    }
  , isVerified: {
      type: 'boolean'
    }
  , isArchived: {
      type: 'boolean'
    }
  , isEnabled: {
      type: 'boolean'
    }
  };
  return products;
});