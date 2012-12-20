/*
  Request-body Validation Middleware
*/

var
  config = require('../config')
, utils  = require('../lib/utils')
, createValidator = function(schema){
    return function(req, res, next){

      // extract out relevant data
      var data = {};
      for (var key in schema) {
        if (typeof req.body[key] !== 'undefined' && req.body[key] !== null) {
          data[key] = ''+req.body[key]; // NOTE: converting to string for validation
        }
      }

      // validate
      var error = utils.validate(data, schema);
      if (error) return utils.sendError(res, error);

      // convert blank strings to null for postgres' sake
      for (var k in data) {
        if (data[k] === '') {
          data[k] = null;
        }
      }

      req.body = data;
      next();
    };
  }
;
module.exports = createValidator;