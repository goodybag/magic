/*
  Routes Validator Middleware
*/

var
  // Module Dependencies
  config    = require('../config')
, schemas   = require('../schemas')
, utils    = require('../lib/utils')
  // Module Variables
, compile = function(obj){
    var compiled = {};
    if (obj.hasOwnProperty('type')) return createValidator(obj);
    for (var key in obj){
      compiled[key] = compile(obj[key]);
    }
    return compiled;
  }
, isOfType = function(prop, type) {
    if (Array.isArray(prop.type)) {
      return (prop.type.indexOf(type) !== -1);
    }
    return prop.type === type;
  }
, createValidator = function(schema){
    return function(req, res, next){

      // extract out relevant data
      var data = {};
      for (var key in schema.properties) {
        var value = req.body[key];

        // coerce into types        
        if (isOfType(schema.properties[key], 'boolean')) {
          if (value === '') {
            value = null;
          } else {
            // special strings
            if (value === '0' || value === 'false') {
              value = false;
            }

            // coerce
            value = !!value;
          }
        }
        else if (isOfType(schema.properties[key], 'number')) {
          if (value === '') {
            value = null;
          } else {
            // coerce
            value = parseInt(value, 10);

            // did it parse?
            if (value != req.body[key]) {  // if !=, then information was lost ('asdf' != NaN, '123 asdf' != 123) so it must not be a number
              value = req.body[key]; // revert back
            }
          }
        }

        // store
        data[key] = req.body[key] = value;
      }

      // validate
      utils.validate(data, schema, function(error){
        if (error) return utils.sendError(res, error);
        next();
      });
    };
  }
;
module.exports = compile(schemas);