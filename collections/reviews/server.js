/**
 * Oddity Businesses
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var desc = require('./description')

// Oddity Businesses.list
server.get(
  '/v1/reviews'
, middleware.validate2.query(desc.collection.methods.get.query)
, routes.list
);

server.get(
  '/v1/reviews/:id'
, routes.get
);

server.put(
  '/v1/reviews/:id'
, middleware.validate2.body(desc.item.methods.put.body)
, routes.update
);
module.exports = server;