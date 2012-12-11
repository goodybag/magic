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
  businesses.save = {
    type: 'object'
  , properties: {
      firstName: {
        required: true
      , type: "string"
      }
    , lastName: {
        required: true
      , type: "string"
      }
    , screenName: {
        required: true
      , type: "string"
      , minLength: 5
      }
    , email: {
        required: true
      , type: "string"
      , minLength: 3
      , pattern: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      }
    , password: {
        required: true
      , type: "string"
      , minLength: 5
      }
    }
  };

  return businesses;
});