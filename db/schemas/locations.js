/**
 * Locations Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
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
    }
  , name: {
      type: 'text'
    , sanitizers: { trim: true }
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
    , validators: { len: 2 }
    }
  , zip: {
      type: 'int'
    , validators: { len: 5 }
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
      type: 'int'
    }
  , lon: {
      type: 'int'
    }
  , isEnabled: {
      type: 'boolean'
    }
  };
  return locations;
});