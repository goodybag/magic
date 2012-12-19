/**
 * Routes Schemas ProductTags
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var productTags = {};

  // base model schema
  // =================
  productTags.model = {
    type: 'object'
  , properties: {
      businessId: {
        required: true
      , pattern: /^[0-9]*$/
      }
    , productId: {
        required: true
      , pattern: /^[0-9]*$/
      }
    , tag: {
        required: true
      }
    }
  };

  // helpers for building other schemas
  function copy(target, prop) {
    target.properties[prop] = {};
    // copy over by property, so no objects are shared between schemas
    for (var k in productTags.model.properties[prop]) {
      target.properties[prop][k] = productTags.model.properties[prop][k];
    }
  }
  function copies(target, props) {
    props.forEach(function(prop) { copy(target, prop); });
  }
  function copyAllExcept(target, exclusions) {
    for (var prop in productTags.model.properties) {
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
    for (var prop in productTags.model.properties) {
      if (productTags.model.properties[prop].required && !target.properties[prop].minLength && !target.properties[prop].length) {
        target.properties[prop].minLength = 1;
      }
    }    
  }

  // create schema
  // =============
  productTags.create = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(productTags.create, []);

  // update schema
  // =============
  productTags.update = {
    type: 'object'
  , properties: {}
  };
  copyAllExcept(productTags.update, []);
  unrequireAll(productTags.update);
  ensureMinLengths(productTags.update);


  return productTags;
});