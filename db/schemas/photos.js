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
    , validators: { isInt:[] }
    }
  , productId: {
      type: 'int'
    , meta: 'references products(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , consumerId: {
      type: 'int'
    , meta: 'references consumers(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , url: {
      type: 'text'
    , validators: { isUrl:[] }
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