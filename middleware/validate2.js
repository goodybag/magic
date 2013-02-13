/*
  Request Validation Middleware
*/

var
  config = require('../config')
, validatorFns = require('../lib/validators')
, sanitizerFns = require('../lib/sanitizers')
, utils  = require('../lib/utils')
, _ = require('underscore')
, validate = function(schema, inputs) {
    schema = schema || {};
    var errors = {}, i, j;
    var unvalidatedKeys = Object.keys(inputs || {});

    for (var k in schema) {
      if (!schema[k].type)
        throw "Schema entry "+k+" is missing `type`";

      var v = inputs[k];

      // update tracking
      var kIndex = unvalidatedKeys.indexOf(k);
      if (kIndex !== -1)
        unvalidatedKeys.splice(kIndex, 1);

      // required validation
      if (typeof v == 'undefined' || v === '') {
        if (schema[k].required)
          errors[k] = 'Required.';
        continue;
      }

      // types validation
      var validators = schema[k].type.split(' ');
      for (i=0; i < validators.length; i++) {

        // parse * trailer
        var canBeArray = /\*$/.test(validators[i]);
        if (canBeArray)
          validators[i] = validators[i].slice(0,-1);

        // parse + trailer
        var mustBeArray =  /\+$/.test(validators[i]);
        if (mustBeArray)
          validators[i] = validators[i].slice(0,-1);

        // get validator
        var validatorFn = validatorFns[validators[i]];
        if (!validatorFn)
          throw "Validator not found: "+validators[i];

        // run validation
        var error;
        if (Array.isArray(v)) {
          if (!canBeArray && !mustBeArray)
            error = 'Can not be an array.';
          else {
            for (j=0; j < v.length; j++) {
              error = validatorFn(v[j], inputs);
              if (error)
                break;
            }
          }
        } else {
          if (mustBeArray)
            error = 'Must be an array.';
          else {
            error = validatorFn(v, inputs);
          }
        }
        if (error) {
          errors[k] = error;
          break;
        }
      }
    }

    // extra data
    if (unvalidatedKeys.length !== 0) {
      unvalidatedKeys.forEach(function(k) {
        errors[k] = 'Invalid attribute';
      });
    }

    return errors;
  }
, createBodyValidator = function(schema){
    return function(req, res, next){
      
      var errors = validate(schema, req.body);
      if (!_.isEmpty(errors)) { return res.error(require('../lib/errors').input.VALIDATION_FAILED, errors); }

      // run sanitizers
      for (var k in schema) {
        if (typeof req.body[k] == 'undefined')
          continue;
        
        var sanitizers = schema[k].type.split(' ');
        for (var i=0; i < sanitizers.length; i++) {

          // the sliced alternative is in case it has an array trailer (+ or *)
          var sanitizerFn = sanitizerFns[sanitizers[i]] || sanitizerFns[sanitizers[i].slice(0,-1)];
          if (!sanitizerFn)
            continue;

          // run sanitization
          if (Array.isArray(req.body[k])) {
            for (var j=0; j < req.body[k].length; j++) {
              req.body[k][j] = sanitizerFn(req.body[k][j]);
            }
          } else {
            req.body[k] = sanitizerFn(req.body[k]);
          }
        }
      }

      next();
    };
  }
, createQueryValidator = function(schema) {
    return function(req, res, next){

      var errors = validate(schema, req.query);
      if (!_.isEmpty(errors)) { return res.error(require('../lib/errors').input.VALIDATION_FAILED, errors); }

      next();
    };
  }
, createPathValidator = function(schema) {
    return function(req, res, next){

      var errors = validate(schema, req.params);
      if (!_.isEmpty(errors)) { return res.error(require('../lib/errors').input.VALIDATION_FAILED, errors); }

      next();
    };
  }
;
module.exports.body = createBodyValidator;
module.exports.query = createQueryValidator;
module.exports.path = createPathValidator;