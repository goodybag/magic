/*
  Request-body Validation Middleware
*/

var
  config = require('../config')
, utils  = require('../lib/utils')
, errors = require('../lib/errors')
, sanitize = require('validator').sanitize
, _ = require('underscore')
, createBodyValidator = function(schema, schemaAdds){
    schema = (schema) ? _.clone(schema) : {};
    // schemaAdds uses a simplified structure of:
    //  { key:{ validator1:[], validator2:[] }}
    if (schemaAdds && typeof schemaAdds == 'object') {
      for (var k in schemaAdds) {
        schema[k] = { validators:schemaAdds[k] };
      }
    }

    return function(req, res, next){
      // run sanitizers
      for (var key in data) {
        if (schema[key].sanitizers) {
          var v = data[key];
          for (var s in schema[key].sanitizers) {
            var sv = sanitize(v);
            v = sv[s].apply(sv, [].concat(schema[key].sanitizers[s]));
          }
          req.body[key] = v;
        }
      }

      // extract out relevant data
      var data = {}, deleted = [];
      for (var key in schema) {
        if (typeof req.body[key] === 'undefined' || req.body[key] === null) continue;
        data[key] = req.body[key];
      }

      // validate
      var error = utils.validate(data, schema);
      if (error) return res.error(errors.input.VALIDATION_FAILED, error);

      // Convert blank strings back to nulls
      for (var key in data){
        if (data[key] === "") data[key] = null;
      }


      next();
    };
  }
, createQueryValidator = function(schema) {
    // schema uses the { key:{ validator1:[], validator2:[] }} structure
    // :TODO: kind of kludgey to convert this to the utils.validate format
    var schema2 = {};
    for (var k in schema) {
      schema2[k] = { validators:schema[k] };
    }
    schema = schema2;
    
    return function(req, res, next){
      // extract out relevant data
      var data = {};
      for (var key in schema) {
        if (typeof req.query[key] === 'undefined' || req.query[key] === null) continue;
        data[key] = req.query[key];
      }

      // validate
      var error = utils.validate(data, schema);
      if (error) return res.error(errors.input.VALIDATION_FAILED, error);

      next();
    }; 
  }
, createPathValidator = function(schema) {
    // schema uses the { key:{ validator1:[], validator2:[] }} structure
    // :TODO: kind of kludgey to convert this to the utils.validate format
    var schema2 = {};
    for (var k in schema) {
      schema2[k] = { validators:schema[k] };
    }
    schema = schema2;
    
    return function(req, res, next){
      // extract out relevant data
      var data = {};
      for (var key in schema) {
        if (typeof req.params[key] === 'undefined' || req.params[key] === null) continue;
        data[key] = req.params[key];
      }

      // validate
      var error = utils.validate(data, schema);
      if (error) return res.error(errors.input.VALIDATION_FAILED, error);

      next();
    }; 
  }
;
module.exports.body = createBodyValidator;
module.exports.query = createQueryValidator;
module.exports.path = createPathValidator;