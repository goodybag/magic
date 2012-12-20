/**
 * Routes Schemas Product Categories
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var productCategories = {};

  // base model schema
  // =================
  productCategories.model = {
    type: 'object'
  // , additionalProperties: 'false'
  , properties: {
      businessId: {
        required: true
      , pattern: /^[0-9]*$/
      }
    , order: {
        required: true
      , pattern: /^[0-9]*$/
      }
    , isFeatured: {
        required: true
      , pattern: /^((true|false)|(0|1{1,1}))$/
      }
    , name: {
        required: true
      , pattern: /[a-z0-9]/
      }
    }
  };

  // helpers for building other schemas
  function copy(target, prop) {
    target.properties[prop] = {};
    // copy over by property, so no objects are shared between schemas
    for (var k in productCategories.model.properties[prop]) {
      target.properties[prop][k] = productCategories.model.properties[prop][k];
    }
  }
  function copies(target, props) {
    props.forEach(function(prop) { copy(target, prop); });
  }
  function copyAllExcept(target, exclusions) {
    for (var prop in productCategories.model.properties) {
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
    for (var prop in productCategories.model.properties) {
      if (productCategories.model.properties[prop].required && !target.properties[prop].minLength && !target.properties[prop].length) {
        target.properties[prop].minLength = 1;
      }
    }
  }

  // create schema
  // =============
  productCategories.create = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(productCategories.create, []);
  unrequireAll(productCategories.create);
  productCategories.create.properties.businessId.required = true;
  productCategories.create.properties.businessId.name = true;

  // update schema
  // =============
  productCategories.update = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(productCategories.update, []);
  unrequireAll(productCategories.update);
  // ensureMinLengths(productCategories.update);

  return productCategories;
});