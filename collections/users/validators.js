/**
 * Routes Schemas Locations
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var users = {};

  // base model schema
  // =================
  users.model = {
    type: 'object'
  , properties: {
      email: {
        type: "string"
      , pattern: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      }
    , password: {
        type: "string"
      , pattern: /^[a-z0-9_-]{6,18}$/
      }
    }
  };

  // helpers for building other schemas
  function copy(target, prop) {
    target.properties[prop] = {};
    // copy over by property, so no objects are shared between schemas
    for (var k in users.model.properties[prop]) {
      target.properties[prop][k] = users.model.properties[prop][k];
    }
  }
  function copies(target, props) {
    props.forEach(function(prop) { copy(target, prop); });
  }
  function copyAllExcept(target, exclusions) {
    for (var prop in users.model.properties) {
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
    for (var prop in users.model.properties) {
      if (users.model.properties[prop].required && !target.properties[prop].minLength && !target.properties[prop].length) {
        target.properties[prop].minLength = 1;
      }
    }
  }

  // create schema
  // =============
  users.create = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(users.create, []);
  unrequireAll(users.create);
  ensureMinLengths(users.create);

  // update schema
  // =============
  users.update = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(users.update, []);
  unrequireAll(users.update);
  ensureMinLengths(users.update);


  return users;
});