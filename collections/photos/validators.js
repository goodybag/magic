/**
 * Routes Schemas Photos
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var photos = {};

  // base model schema
  // =================
  photos.model = {
    type: 'object'
  , properties: {
      businessId: {
        required: false
      , pattern: /^[0-9]*$/
      }
    , productId: {
        required: false
      , pattern: /^[0-9]*$/
      }
    , consumerId: {
        required: false
      , pattern: /^[0-9]*$/
      }
    , url: {
        required: true
      }
    , notes: {
        required: false
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
    for (var k in photos.model.properties[prop]) {
      target.properties[prop][k] = photos.model.properties[prop][k];
    }
  }
  function copies(target, props) {
    props.forEach(function(prop) { copy(target, prop); });
  }
  function copyAllExcept(target, exclusions) {
    for (var prop in photos.model.properties) {
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
    for (var prop in photos.model.properties) {
      if (photos.model.properties[prop].required && !target.properties[prop].minLength && !target.properties[prop].length) {
        target.properties[prop].minLength = 1;
      }
    }    
  }

  // create schema
  // =============
  photos.create = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(photos.create, []);

  // update schema
  // =============
  photos.update = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(photos.update, []);
  unrequireAll(photos.update);
  ensureMinLengths(photos.update);


  return photos;
});