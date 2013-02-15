/**
 * Visits Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var visits = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , tapinId: {
      type: 'int'
    , meta: 'references tapins(id)'
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
  , tapinStationId: {
      type: 'int'
    , meta: 'references "tapinStations"(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , userId: {
      type: 'int'
    , meta: 'references users(id) on delete set null'
    , validators: { isInt:[] }
    }
  , isFirstVisit: {
      type: 'boolean'
    , validators: { is:/true|false|1|0/ }
    , sanitizers: { toBoolean:[] }
  }
  , dateTime: {
      type: 'timestamp'
    , meta: 'without time zone default now() not null'
    }
  };
  return visits;
});