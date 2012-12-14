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
        if (typeof req.body[key] !== 'undefined') {
          data[key] = ''+req.body[key]; // NOTE: converting to string for validation
        }
      }

      // validate
      utils.validate(data, schema, function(error){
        if (error) return utils.sendError(res, error);

        // convert blank strings to null for postgres' sake
        for (var k in data) {
          if (data[k] === '') {
            data[k] = null;
          }
        }

        req.body = data;
        next();
      });
    };
  }
;
module.exports = compile(schemas);