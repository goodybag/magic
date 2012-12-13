/**
 * Routes Schemas Businesses
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var businesses = {};
  businesses.model = {
    type: 'object'
  , properties: {
      name: {
        required: true
      , type: "string"
      }
    , url: {
        required: false
      , type: "string"
      , pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      }
    , cardCode: {
        required: true
      , type: "string"
      , minLength: 6
      , maxLength: 6
      }
    , street1: {
        required: true
      , type: "string"
      }
    , street2: {
        required: true
      , type: "string"
      }
    , city: {
        required: true
      , type: "string"
      }
    , state: {
        required: true
      , type: "string"
      , minLength: 2
      , maxLength: 2
      }
    , zip: {
        required: true
      , type: "number"
      , minLength: 5
      , maxLength: 5
      }
    , state: {
        required: true
      , type: "string"
      }
    , enabled: {
        required: true
      , type: "boolean"
      }
    }
  };

  // Create route doesn't need to have cardCode or enabled properties
  businesses.create = {
    type: 'object'
  , properties: {}
  };

  // Update can't have any required fields
  businesses.update = {
    type: 'object'
  , properties: {}
  };

  for (var key in businesses.model.properties){
    businesses.create.properties[key] = {};
    businesses.update.properties[key] = {};
    for (var p in businesses.model.properties[key]) {
      businesses.create.properties[key][p] = businesses.model.properties[key][p];
      businesses.update.properties[key][p] = businesses.model.properties[key][p];
    }

    businesses.update.properties[key].required = false;
  }

  // When the data is being posted, everything is a string
  // businesses.create.properties.zip.type           = "string";
  // businesses.update.properties.zip.type           = "string";

  // Don't require some stuff
  businesses.create.properties.street2.required   = false;
  businesses.create.properties.cardCode.required  = false;
  businesses.create.properties.enabled.required   = false;

  return businesses;
});