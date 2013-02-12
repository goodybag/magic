/**
 * Tapin Station Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var tapinStations = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , userId: {
      type: 'int'
    , meta: 'references users on delete cascade'
    , validators: { isInt:[] }
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses'
    , validators: { isInt:[] }
    }
  , locationId: {
      type: 'int'
    , meta: 'references locations'
    , validators: { isInt:[] }
    }
  , loyaltyEnabled: {
      type: 'boolean'
    , validators: { is: /true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
    }
  , galleryEnabled: {
      type: 'boolean'
    , validators: { is: /true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
    }
  };
  return tapinStations;
});