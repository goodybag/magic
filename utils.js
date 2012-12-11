/*
  Utils
*/

var
  // Third Party Dependencies
  crypto    = require('crypto')
, amanda    = require('amanda')
, _         = require('underscore')

  // Module Dependencies
, config    = require('./config')

  // Module Variables
, defaults  = config.defaults
, validator = amanda('json')

  // Make underscores functionality available on utils
, utils     = _.extend({}, _)
;

/**
 * Validates a document with a given schema
 * @param  {Object}   data     The document to validated
 * @param  {Object}   schema   The schema to validate against
 * @param  {Object}   options  Optional options for amanda - Uses default gb options
 * @param  {Function} callback Passed the errors object if there were verrors
 * @return {Null}
 */
utils.validate = function(data, schema, options, callback){
  if (typeof options === "function"){
    callback = options;
    options = config.validationOptions;
  }
  validator.validate(data, schema, options, function(errors){
    if (errors) errors.type = "validation";
    callback(errors);
  });
};

/**
 * Expands a flattened query object
 * @param  {Object} doc The flattened document to be expanded
 * @return {Object}     The flattened document
 */
utils.expandDoc = function(doc){
  var expanded = {}, parts, deepObj, curr, currKey;
  for (var key in doc){
    if (key.indexOf(".")){
      parts   = key.split('.');
      deepObj = doc[key];
      while (parts.length > 1){
        currKey       = parts.pop();
        curr          = {};
        curr[currKey] = deepObj;
        deepObj       = curr;
      }
      expanded[parts[0]] = deepObj;
    }else expanded[key]  = doc[key];
  }
  return expanded;
};

/**
 * Flattens a query object to be used with mongo queries { "some.thing.else": "blah" }
 * @param  {Object}  doc        The nested query object to be flattened
 * @param  {String}  startPath  Top level key
 * @return {Object}             The flattened document
 */
utils.flattenDoc = function(doc, startPath){
  var flat = {},
  flatten = function(obj, path){
    if (typeof obj === "object"){
      (path && (path += ".")) || (path = "");
      for (var key in obj) flatten(obj[key], path + key);
    }else if (Object.isArray(obj)){
      (path && (path += ".")) || (path = "");
      i = 0;
      while (i < obj.length){
        flatten(obj[i], path + i);
        i++;
      }
    }else{
      flat[path] = obj;
    }
    return flat;
  };
  return flatten(doc, startPath);
}

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
  var result = crypto.createHash('md5').update(password + defaults.passwordSalt).digest('hex')
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

/**
 * Adds CORS headers to the response
 * @param  {ServerResponse} res     The response which will receive the headers
 * @param  {Object}         options Configures the headers (optional)
 * @return {undefined}
 */
utils.setResponseCORS = function(res, options) {
  options = options || {};
  res.setHeader('Access-Control-Allow-Origin',      '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods',     options.methods       || 'OPTIONS, HEAD, GET');
  res.setHeader('Access-Control-Allow-Headers',     options.allowHeaders  || 'Content-type');
  res.setHeader('Access-Control-Expose-Headers',    options.exposeHeaders || 'Allow, Link, Content-type');

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