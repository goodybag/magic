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
, createValidator = function(schema){
    return function(req, res, next){

      // coerce into types
      for (var key in schema.properties) {
        var value = req.body[key];
        switch (schema.properties[key].type) {
          case 'number':
            value = parseInt(value, 10);
            if (isNaN(value)) { value = 0; }
            if (value == req.body[key]) {
              req.body[key] = value;
            }
            break;
        }
      }

      // extract out relevant values
      var data = {};
      for (var key in schema.properties){
        data[key] = req.body[key];
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