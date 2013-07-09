var config = require('../config');
var request = require('request');
var client = module.exports = {};

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

client.search = function(type, query, callback){
  if (typeof type == 'object'){
    callback = query;
    query = type;
    type = null;
  }

  var req = {
    method: 'GET'
  , url:    config.elasticsearch.host + '/' + config.elasticsearch.index
  , json:   query
  };

  if (type) req.url += '/' + type;

  req.url += '/_search';
console.log(req.url, req.json);
  request(req, function(error, response, body){
    if (response.statusCode >= 400) return callback ? callback( body.error ) : null;

    if (callback) callback(null, body);
  });
};