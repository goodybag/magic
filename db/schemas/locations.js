/**
 * Locations Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

var regs = {
  time: /^[\d]{1,2}\:?[\d]{1,2} ?(am|pm)?$/i
}

define(function(require){
  var locations = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete cascade'
    , validators: { isInt:[], notNull:[] }
    }
  , name: {
      type: 'text'
    , sanitizers: { trim:[] }
    }
  , street1: {
      type: 'text'
    }
  , street2: {
      type: 'text'
    }
  , city: {
      type: 'text'
    }
  , state: {
      type: 'text'
    , validators: { len:2 }
    }
  , zip: {
      type: 'int'
    , validators: { len:5 }
    }
  , country: {
      type: 'text'
    }
  , phone: {
      type: 'text'
    }
  , fax: {
      type: 'text'
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
  , startSunday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , endSunday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , startMonday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , endMonday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , startTuesday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , endTuesday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , startWednesday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , endWednesday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , startThursday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , endThursday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , startFriday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , endFriday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , startSaturday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , endSaturday: {
      type: 'time'
    , validators: { is: regs.time }
    }
  , isEnabled: {
      type: 'boolean'
    , meta: 'default TRUE'
    , validators: { is:/true|false|1|0/ }
    }
  };
  return locations;
});