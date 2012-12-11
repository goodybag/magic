/*
  Routes Validator Middleware
*/

var
  // Module Dependencies
  config    = require('../config')
, schemas   = require('../schemas')
, utils    = require('../utils')
  // Module Variables
, compile = function(obj){
    var compiled = {};
    if (obj.hasOwnProperty('type')) return createValidator(obj);
    for (var key in obj){
      compiled[key] = compile(obj[key]);
    }
    return compiled;
  }
, createValidator = function(schema){
    return function(req, res, next){
      var data = {};
      for (var key in schema.properties){
        data[key] = req.body[key];
      }
      utils.validate(data, schema, function(error){
        if (error) return utils.sendError(res, error);
        next();
      });
    };
  }
;
module.exports = compile(schemas);