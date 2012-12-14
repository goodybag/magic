/**
 * Routes Schemas Locations
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var locations = {};

  // base model schema
  // =================
  locations.model = {
    type: 'object'
  , properties: {
      businessId: {
        required: true
      , type: "number"
      }
    , name: {
        required: true
      , type: "string"
      }
    , street1: {
        required: true
      , type: "string"
      }
    , street2: {
        required: false
      , type: ["string", "null"]
      }
    , city: {
        required: true
      , type: "string"
      , minLength: 1
      }
    , state: {
        required: true
      , type: "string"
      , length: 2
      }                 
    , zip: {
        required: true
      , type: ["number", "null"]
      , length: 5
      }
    , country: {
        required: true
      , type: "string"
      }
    , phone: {
        required: false
      , type: ["string", "null"]
      }
    , fax: {
        required: false
      , type: ["string", "null"]
      }
    , lat: {
        required: false
      , type: ["number", "null"]
      }
    , lon: {
        required: false
      , type: ["number", "null"]
      }
    , enabled: {
        required: true
      , type: "boolean"
      }
    }
  };

  // helpers for building other schemas
  function copy(target, prop) {
    target.properties[prop] = {};
    // copy over by property, so no objects are shared between schemas
    for (var k in locations.model.properties[prop]) {
      target.properties[prop][k] = locations.model.properties[prop][k];
    }
  }
  function copies(target, props) {
    props.forEach(function(prop) { copy(target, prop); });
  }
  function copyAllExcept(target, exclusions) {
    for (var prop in locations.model.properties) {
      if (exclusions.indexOf(prop) !== -1) { continue; }
      copy(target, prop);
    }
  }
  function unrequire(target, props) {
    props.forEach(function(prop) {
      target.properties[prop].required = false;
    });
  }
  function unrequireAll(target) {
    unrequire(target, Object.keys(target.properties));
  }
  function ensureMinLengths(target) {
    for (var prop in locations.model.properties) {
      if (locations.model.properties[prop].required && !target.properties[prop].minLength && !target.properties[prop].length) {
        target.properties[prop].minLength = 1;
      }
    }    
  }

  // create schema
  // =============
  locations.create = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(locations.create, []);
  unrequireAll(locations.create);
  ensureMinLengths(locations.create);

  // update schema
  // =============
  locations.update = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(locations.update, []);
  unrequireAll(locations.update);
  ensureMinLengths(locations.update);


  return locations;
});