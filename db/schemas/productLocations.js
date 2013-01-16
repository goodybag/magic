/**
 * Product Locations Cache Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var productLocations = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , productId: {
      type: 'int'
    , meta: 'references products(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , locationId: {
      type: 'int'
    , meta: 'references locations(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , lat: {
      type: 'double precision'
    , sanitizers: { ifNull:0 }
    }
  , lon: {
      type: 'double precision'
    , sanitizers: { ifNull:0 }
    }
  , position: {
      type: 'earth'
    }
  , createdAt: {
      type: 'timestamp'
    }
  };
  return productLocations;
});