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
      type: 'int'
    , meta: 'primary key references users on delete cascade'
    , validators: { isInt:[] }
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete set null'
    , validators: { isInt:[] }
    }
  , locationId: {
      type: 'int'
    , meta: 'references locations(id) on delete cascade'
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
  , numUnconfirmedPunchesAllowed: {
      type: 'int'
    , sanitizers: { isInt:[] }
    }
  };
  return tapinStations;
});