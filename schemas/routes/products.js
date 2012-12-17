/**
 * Routes Schemas Products
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var products = {};

  // base model schema
  // =================
  products.model = {
    type: 'object'
  , properties: {
      businessId: {
        required: true
      , pattern: /^[0-9]*$/
      }
    , name: {
        required: true
      }
    , enabled: {
        required: false
      , pattern: /true|false|1|0/
      }
    }
  };

  // helpers for building other schemas
  function copy(target, prop) {
    target.properties[prop] = {};
    // copy over by property, so no objects are shared between schemas
    for (var k in products.model.properties[prop]) {
      target.properties[prop][k] = products.model.properties[prop][k];
    }
  }
  function copies(target, props) {
    props.forEach(function(prop) { copy(target, prop); });
  }
  function copyAllExcept(target, exclusions) {
    for (var prop in products.model.properties) {
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
    for (var prop in products.model.properties) {
      if (products.model.properties[prop].required && !target.properties[prop].minLength && !target.properties[prop].length) {
        target.properties[prop].minLength = 1;
      }
    }
  }

  // create schema
  // =============
  products.create = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(products.create, []);

  // update schema
  // =============
  products.update = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(products.update, []);
  unrequireAll(products.update);
  ensureMinLengths(products.update);

  return products;
});