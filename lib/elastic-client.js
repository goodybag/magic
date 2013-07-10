var request = require('request');

var Client = module.exports = function(options){
  if (!options.host)  throw new Error('Elasticsearch option `host` required');
  if (!options.index) throw new Error('Elasticsearch option `index` required');

  this.host   = options.host;
  this.index  = options.index;

  return this;
};

/**
 * Explicitly create an index - really shouldn't be used ever because
 * elastic search will automatically create new indexes when saving
 * documents
 * @param  {String}   name     Name of the index
 * @param  {Object}   options  Options for the elasticsearch index
 * @param  {Function} callback Obviously the callback(error)
 */
Client.createIndex = function(host, name, options, callback){
  if (typeof options == 'function'){
    callback = options;
    options = {};
  }

  var req = {
    method: 'PUT'
  , url:    host + '/' + name
  , json:   options
  };

  request(req, function(error, response, body){
    if (response.statusCode >= 400) return callback ? callback( body.error ) : null;

    if (callback) callback();
  });
};

/**
 * Ensure the index that this client is associated to has been created
 * @param  {Object}   options  Options for the elasticsearch index
 * @param  {Function} callback Obviously the callback(error)
 */
Client.prototype.ensureIndex = function(options, callback){
  if (typeof options == 'function'){
    callback = options;
    options = {};
  }

  Client.createIndex( this.host, this.index, options, callback);

  return this;
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
Client.prototype.index = function(type, doc, callback){
  var req = {
    method: 'PUT'
  , url:    this.host + '/' + this.index + '/' + type
  , json:   doc
  };

  if (doc.id) req.url += '/' + doc.id;

  request(req, function(error, response, body){
    if (response.statusCode >= 400) return callback ? callback( body.error ) : null;

    if (callback) callback(null, body);
  });

  return this;
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
Client.prototype.search = function(type, query, callback){
  if (typeof type == 'object'){
    callback = query;
    query = type;
    type = null;
  }

  var req = {
    method: 'POST'
  , url:    this.host + '/' + this.index
  , json:   query
  };

  if (type) req.url += '/' + type;

  req.url += '/_search';

  request(req, function(error, response, body){
    if (response.statusCode >= 400) return callback ? callback( body.error ) : null;

    if (callback) callback(null, body);
  });

  return this;
};