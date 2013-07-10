var config = require('../config');
var request = require('request');
var client = module.exports = {};

/**
 * Explicitly create an index - really shouldn't be used ever because
 * elastic search will automatically create new indexes when saving
 * documents
 * @param  {String}   name     Name of the index
 * @param  {Object}   options  Options for the elasticsearch index
 * @param  {Function} callback Obviously the callback(error)
 */
client.createIndex = function(name, options, callback){
  if (typeof options == 'function'){
    callback = options;
    options = {};
  }

  var req = {
    method: 'PUT'
  , url:    config.elasticsearch.host + '/' + name
  , json:   options
  };

  request(req, function(error, response, body){
    if (response.statusCode >= 400) return callback ? callback( body.error ) : null;

    if (callback) callback();
  });
};

/**
 * Add or update a document making it searchable
 *
 * PUT /{index}/{type}/{id}
 *     /staging/products/123
 *
 * See http://www.elasticsearch.org/guide/reference/api/index_/
 * for more details
 *
 * @param  {String}   type     OPTIONAL elastic search document type
 * @param  {Object}   doc      The document to add or update
 * @param  {Function} callback Obviously the callback(error, result)
 */
client.index = function(type, doc, callback){
  var req = {
    method: 'PUT'
  , url:    config.elasticsearch.host + '/' + config.elasticsearch.index + '/' + type
  , json:   doc
  };

  if (doc.id) req.url += '/' + doc.id;

  request(req, function(error, response, body){
    if (response.statusCode >= 400) return callback ? callback( body.error ) : null;

    if (callback) callback(null, body);
  });
};

/**
 * Perform a search on elasticserach
 *
 * For all properties for search, see:
 * http://www.elasticsearch.org/guide/reference/api/search/
 *
 * Most searches use the query object, which uses the query-dsl:
 * http://www.elasticsearch.org/guide/reference/query-dsl/
 *
 * {
 *   query:   { ... }
 * , sort:    { ... }
 * , fields:  { ... }
 * , ...
 * }
 *
 * @param  {String}   type     Optional elastic search doc type
 * @param  {Object}   query    Elastic search query dsl object
 * @param  {Function} callback Obviously the callback(error, results)
 */
client.search = function(type, query, callback){
  if (typeof type == 'object'){
    callback = query;
    query = type;
    type = null;
  }

  var req = {
    method: 'POST'
  , url:    config.elasticsearch.host + '/' + config.elasticsearch.index
  , json:   query
  };

  if (type) req.url += '/' + type;

  req.url += '/_search';

  request(req, function(error, response, body){
    if (response.statusCode >= 400) return callback ? callback( body.error ) : null;

    if (callback) callback(null, body);
  });
};