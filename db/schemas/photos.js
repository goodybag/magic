/**
 * Photos Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var photos = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete cascade'
    , validators: { isInt: true }
    }
  , productId: {
      type: 'int'
    , meta: 'references products(id) on delete cascade'
    , validators: { isInt: true }
    }
  , consumerId: {
      type: 'int'
    // :TODO: , meta: 'references businesses(id) on delete cascade'
    , validators: { isInt: true }
    }
  , url: {
      type: 'text'
    , validators: { isUrl: true }
    }
  , notes: {
      type: 'text'
    }
  , lat: {
      type: 'int'
    }
  , lon: {
      type: 'int'
    }
  , isEnabled: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    }
  , createdAt: {
      type: 'timestamp'
    }
  };
  return photos;
});