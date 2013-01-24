/*
  Request-body Validation Middleware
*/

var
  config = require('../config')
, utils  = require('../lib/utils')
, errors = require('../lib/errors')
, sanitize = require('validator').sanitize
, _ = require('underscore')
, createValidator = function(schema, schemaAdds){
    schema = (schema) ? _.clone(schema) : {};
    // schemaAdds uses a simplified structure of:
    //  { key:{ validator1:[], validator2:[] }}
    if (schemaAdds && typeof schemaAdds == 'object') {
      for (var k in schemaAdds) {
        schema[k] = { validators:schemaAdds[k] };
      }
    }

    return function(req, res, next){
      // extract out relevant data
      var data = {}, deleted = [];
      for (var key in schema) {
        if (typeof req.body[key] === 'undefined' || ("" + req.body[key]) === "null") continue;
if (req.body.name === "Ballers, Inc. 2") console.log(req.body[key]);
        // Ensure we're not convering an object or array
        if (!utils.isArray(req.body[key]) && !utils.isObject(req.body[key])) {
          data[key] = ''+req.body[key]; // NOTE: converting to string for validation
        }else{
          data[key] = req.body[key];
        }
      }

      // validate
      if (req.body.name === "Ballers, Inc. 2") console.log(data);
      var error = utils.validate(data, schema);
      if (error) return res.error(errors.input.VALIDATION_FAILED, error);

      // Convert blank strings back to nulls
      for (var key in data){
        if (data[key] === "") data[key] = null;
      }

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

      next();
    };
  }
;
module.exports = createValidator;