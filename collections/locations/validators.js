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
      , pattern: /^[0-9]*$/
      }
    , name: {
        required: true
      }
    , street1: {
        required: true
      }
    , street2: {
        required: false
      }
    , city: {
        required: true
      , minLength: 1
      }
    , state: {
        required: true
      , length: 2
      }
    , zip: {
        required: true
      , pattern: /[0-9]{5}/
      }
    , country: {
        required: true
      }
    , phone: {
        required: false
      , pattern: /[0-9\-\(\)]*/
      }
    , fax: {
        required: false
      , pattern: /[0-9\-\(\)]*/
      }
    , lat: {
        required: false
      , pattern: /[0-9]*/
      }
    , lon: {
        required: false
      , pattern: /[0-9]*/
      }
    , isEnabled: {
        required: false
      , pattern: /true|false|1|0/
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