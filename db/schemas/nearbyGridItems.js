/**
 * NearbyGridItems Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var nearbyGridItems = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    , validators: { isInt:[] }
    }
  , productId: {
      type: 'int'
    , meta: 'references products(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , locationId: {
      type: 'int'
    , meta: 'references locations(id) on delete cascade'
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete cascade'
    }
  , lat: {
      type: 'double precision'
    , validators: { isFloat:[] }
    , sanitizers: { ifNull:0 }
    }
  , lon: {
      type: 'double precision'
    , validators: { isFloat:[] }
    , sanitizers: { ifNull:0 }
    }
  , position: {
      type: 'earth'
    }
  , createdAt: {
      type: 'timestamp'
    , meta: 'default now()'
    }
  , isActive: {
      type: 'bool'
    , meta: 'default true'
    , validators: { isBool:[] }
    }
  };
  return nearbyGridItems;
});