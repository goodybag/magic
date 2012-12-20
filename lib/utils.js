/*
  Utils
*/

var
  // Third Party Dependencies
  crypto    = require('crypto')
, request   = require('request')
, node_validator = require('validator')
, _         = require('underscore')

  // Module Dependencies
, config    = require('../config')

  // Make underscores functionality available on utils
, utils     = _.extend({}, _)
;

utils.get = function(url, callback){
  var options = {
    url: url
  , method: "GET"
  , json: true
  };
  request(options, callback);
};

utils.post = function(url, data, callback){
  var options = {
    url: url
  , method: "POST"
  , json: true
  , form: data
  };
  request(options, callback);
};

utils.put = function(url, data, callback){
  var options = {
    url: url
  , method: "PUT"
  , json: true
  , form: data
  };
  request(options, callback);
};

utils.patch = function(url, data, callback){
  var options = {
    url: url
  , method: "PATCH"
  , json: true
  , form: data
  };
  request(options, callback);
};

utils.del = function(url, callback){
  var options = {
    url: url
  , method: "DELETE"
  , json: true
  };
  request(options, callback);
};

/**
 * Adds selects for an object of node-sql columns, mapping the columns (with 'as') to their keynames
 * @param  {Object} a node-sql query object (table)
 * @param  {Object} an object mapping keys to node-sql columns
 * @return {Object} the modified query
 */
utils.selectAsMap = function(query, fields) {
    var asFields = [];
    for (var name in fields) {
      if (typeof fields[name] !== 'object') { continue; }
      asFields.push(fields[name].as(name));
    }
    return query.select.apply(query, asFields);
}

/**
 * Validates a document with a given schema
 * @param  {Object}   data     The document to validated
 * @param  {Object}   schema   The schema to validate against
 * @return {Object}   errors   The errors created by validation (or null for success)
 */
utils.validate = function(data, schema){
  var errors = {};
  var v = new node_validator.Validator();
  for (var field in schema) {
    // skip if no validators or data
    if (!schema[field].validators || !data[field]) { continue; }

    for (var validator in schema[field].validators) {
      var params = schema[field].validators[validator];
      try {
        var validators = v.check(data[field]);
        validators[validator].apply(v, [].concat(params));
      }
      catch (e) {
        var error = { field:field, message:e.message, validator:validator };
        if (Array.isArray(params)) {
          error.params = params;
        }
        errors[field] = ((errors[field]) ? errors[field] : []).concat(error);
      }
    }
  }

  return _.isEmpty(errors) ? null : errors;
};

/**
 * Encrypts consumer passwords
 * @param  {String}   password  The password to encrypt
 * @param  {Function} callback  returns the error/data.
 * @return {null}
 */
utils.encryptPassword = function(password, callback){
  var result = crypto.createHash('md5').update(password + config.passwordSalt).digest('hex');
  if (callback) return callback(null, result);
  return result;
};

/**
 * Copmares a non-encrypted password with an encrypted one
 * @param  {String}   password  The non-encrypted string
 * @param  {String}   encrypted The encrypted string
 * @param  {Function} callback  Contains the results (error, success)
 * @return {Null}
 */
utils.comparePasswords = function(password, encrypted, callback){
  var result = crypto.createHash('md5').update(password + config.passwordSalt).digest('hex')
  if (callback) return callback(null, result === encrypted);
  return result === encrypted;
};

/**
 * [interceptFunctions
 * Given a collection of functions, returns a collection of intercepted functions
 * specified by the given domain
 * You can pass in an object, an array, or just all the functions as parameters]
 * @param  {domain}     dom   [the domain to intercept]
 * @param  {collection} rest  [the collection to be intercepted]
 * @return {collection}       [the intercepted function collection]
 */
utils.interceptFunctions = function(dom, rest){
  var functions;
  if (typeof rest === "object"){
    functions = {};
    for (var key in rest){
      functions[key] = dom.intercept(rest[key]);
    }
  }else {
    functions = (Object.prototype.toString.call(rest)[8] == "A")
                ? rest : Array.prototype.slice.call(rest, 1);
    for (var i = 0; i < functions.length; i++){
      functions[i] = dom.intercept(functions[i]);
    }
  }
  return functions;
};

utils.sendJSON = function(res, json){
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  // res.header('Access-Control-Allow-Origin', 'http://local.goodybag.com');
  // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  // res.header('Access-Control-Allow-Credentials', true);
  // res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization');
  // res.cookie('remember', 1, { domain : "test-project" });
  res.json(json);
};

utils.sendError = function(res, error){
  utils.sendJSON(res, { error: error });
};

utils.noop = function(){};

/**
 * Contains the default structure for errors
 * @param  {String} message Nice message to be displayed
 * @param  {String} type    The type of error
 * @return {Object}         The error object
 */
utils.error = function(message, type){
  return {
    message: message
  , type: type
  };
};

module.exports = utils;