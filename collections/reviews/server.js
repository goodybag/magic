/**
 * Oddity Businesses
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var schema     = require('../../db').schemas.oddityLive;
var schema     = require('../../db').schemas.oddityMeta;

// Oddity Businesses.list
server.get(
  '/v1/reviews'
  , routes.list
);

server.get(
  '/v1/reviews/:id'
  , routes.get
);

server.put(
  '/v1/reviews/:id'
  , routes.hide
);
module.exports = server;