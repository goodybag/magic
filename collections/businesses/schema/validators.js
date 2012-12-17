/**
 * Businesses Validator
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
      }
    , url: {
        required: false
      , pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      }
    , cardCode: {
        required: true
      , length: 6
      }
    , street1: {
        required: true
      }
    , street2: {
        required: true
      }
    , city: {
        required: true
      }
    , state: {
        required: true
      , length: 2
      }
    , zip: {
        required: true
      , pattern: /[0-9]{5}/
      }
    , isEnabled: {
        required: true
      , pattern: /true|false|0|1/
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
  businesses.create.properties.isEnabled.required   = false;

  return businesses;
});