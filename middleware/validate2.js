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

    // query-param to avoid caching is ok
    delete inputs._;

    var errors = {}, i, j;
    var unvalidatedKeys = Object.keys(inputs || {});

    for (var k in schema) {
      if (!schema[k].type)
        throw "Schema entry "+k+" is missing `type`";

      var v = inputs[k], unless;

      // update tracking
      var kIndex = unvalidatedKeys.indexOf(k);
      if (kIndex !== -1)
        unvalidatedKeys.splice(kIndex, 1);

      // required validation
      if (typeof v == 'undefined' || v === '' || v === null) {
        if (schema[k].required){
          if (typeof schema[k].required === "boolean")
            errors[k] = 'Required.';
          else if (typeof schema[k].required === "object"){
            unless = schema[k].required.unless;
            if (unless){
              if (inputs[unless] == 'undefined' || inputs[unless] == '' || inputs[unless] == null)
                errors[k] = 'Required.';
            }
          }
        }
        // treat any blank string as a null
        if (v === '')
          inputs[k] = null;
        continue;
      }

      // choices validation
      if (schema[k].choices) {
        if (!Array.isArray(schema[k].choices))
          throw "Schema `choices` must be an array";

        if (Array.isArray(v)) {
          for (var i=0; i < v.length; i++) {
            if (schema[k].choices.indexOf(v[i]) === -1) {
              errors[k] = 'Must be one of: '+schema[k].choices.join(', ');
              continue;
            }
          }
        } else {
          if (schema[k].choices.indexOf(v) === -1) {
            errors[k] = 'Must be one of: '+schema[k].choices.join(', ');
            continue;
          }
        }
      }


      // types validation - start off with types
      var validators = schema[k].type.split(' ');

      // Try out each attribute and see if there's a function for it
      for (var attr in schema[k]){
        if (typeof validatorFns[attr] == 'function') validators.push(attr);
      }

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
              error = validatorFn(v[j], inputs, k, schema[k], schema[k].arguments ? schema[k].arguments[validators[i]] : null);
              if (error)
                break;
            }
          }
        } else {
          if (mustBeArray)
            error = 'Must be an array.';
          else {
            error = validatorFn(v, inputs, k, schema[k], schema[k].arguments ? schema[k].arguments[validators[i]] : null);
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
    // Prepare validator args array
    for (var key in schema){
      schema[key].arguments = {};

      for (var attr in schema[key]){
        if (attr == 'arguments') continue;

        // If they're providing an array, use that as args
        // Else make an array with a single item in it
        if (Array.isArray(schema[key]))
          schema[key].arguments[attr] = schema[key][attr];
        else
          schema[key].arguments[attr] = [schema[key][attr]];
      }
    }

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
              if (req.body[k][j] !== null)
                req.body[k][j] = sanitizerFn(req.body[k][j]);
            }
          } else {
            if (req.body[k] !== null)
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
module.exports.noBody = createBodyValidator({});
module.exports.noQuery = createBodyValidator({});
module.exports.noPath = createBodyValidator({});