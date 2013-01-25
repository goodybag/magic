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
  , locationId: {
      type: 'int'
    , meta: 'references locations(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , consumerId: {
      type: 'int'
    , meta: 'references consumers(id) on delete set null'
    , validators: { isInt:[] }
    }
  , dateTime: {
      type: 'timestamp'
    , meta: 'without time zone default now() not null'
    }
  };
  return visits;
});