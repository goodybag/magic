/*
  Utils
*/

var
  // Third Party Dependencies
  crypto    = require('crypto')
, fs        = require('fs')
, request   = require('request')
, async     = require('async')
, _         = require('underscore')
, node_validator = require('validator')

  // Module Dependencies
, config    = require('../config')
, errors    = require('./errors')

  // Make underscores/async functionality available on utils
, utils     = _.extend({}, _, async)
;

utils.requireDir = function(path, options){
  var defaults = {
    recursive: false
  , relativeToProcess: true
  , ignoreIndex: true
  };

  if (options){
    for (var key in defaults){
      if (!options.hasOwnProperty(key)) options[key] = defaults[key];
    }
  } else {
    options = defaults;
  }

  var modules = {};

  if (path.substring(0, 2) === "./")
    path = (options.relativeToProcess ? process.cwd() : __dirname) + path.substring(1);

  var files = fs.readdirSync(path);
  for (var i = files.length - 1, name, stat, isModule; i >= 0; i--){
    name = files[i];
    isModule = false;

    if (options.ignoreIndex && name === "index.js") continue;

    stat = fs.statSync(path + '/' + name);

    if (name.substring(name.length - 3) === ".js"){
      name = name.substring(0, name.length - 3);
      isModule = true;
    }
    else if (name.substring(name.length - 5) === ".json"){
      name = name.substring(0, name.length - 5);
      isModule = true;
    }

    if (options.recursive && stat.isDirectory())
      modules[name] = utils.requireDir(path + '/' + name, options);
    else if (isModule) modules[name] = require(path + '/' + name);
  }

  return modules;
};

utils.get = function(url, options, callback){
  if (typeof options === "function"){
    callback = options;
    options = {};
  }

  options = utils.extend({
    url: url
  , method: "GET"
  , json: true
  }, options);
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
  var checkItem = function(item, validator, validatorParams) {
    try {
      var vWrap = v.check(item); // wrap the input in a validator object
      vWrap[validator].apply(v, [].concat(validatorParams)); // run the validator
    }
    catch (e) {
      // produce the error object
      var error = { field:field, message:e.message, validator:validator, params:validatorParams };
      errors[field] = ((errors[field]) ? errors[field] : []).concat(error);
    }
  };

  for (var field in schema) {
    // skip if no validators or data
    if (!schema[field].validators || !(field in data)) { continue; }

    // Unless specified otherwise, nulls are ok in my book
    if (data[field] == null && !('notNull' in schema[field].validators))
      continue;
    if (data[field] == '' && !('notEmpty' in schema[field].validators))
      continue;

    for (var validator in schema[field].validators) {
      var params = schema[field].validators[validator];
      if (Array.isArray(data[field])) {
        data[field].forEach(function(item) { checkItem(item, validator, params); });
      } else {
        checkItem(data[field], validator, params);
      }
    }
  }

  return _.isEmpty(errors) ? null : errors;
};

/**
 * Adds pagination to a node-sql query according to the request query parameters
 * @param  {ServerRequest} req   The request
 * @param  {Query}         query The query to modify
 * @return {Query}               The modified query
 */
utils.paginateQuery = function(req, query) {
    var offset = 0;
    var limit = 20;
    if (req.param('limit')) {
      limit = parseInt(req.param('limit')) || limit;
      if (limit < 1) limit = 1;
    }
    if (req.param('offset')) {
      offset = parseInt(req.param('offset')) || offset;
      if (offset < 0) offset = 0;
    }
    return query.limit(limit).offset(offset);
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

utils.sendError = function(res, error, details){
  if (typeof error === 'string') {
    error = errors[error];
  }
  error.details = details;
  res.status(error.httpCode);
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