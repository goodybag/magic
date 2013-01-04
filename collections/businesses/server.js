/**
 * Businesses server
 */

var server     = require('express')();
var middleware = require('../../middleware');
var schema     = require('../../db').schemas.businesses;
var fields     = require('./fields');
var routes     = require('./routes');

// Businesses.get
server.get(
  '/v1/businesses'
, middleware.fields(fields)
, routes.list
);

// Businesses.get
server.get(
  '/v1/businesses/:id'
, middleware.fields(fields)
, routes.get
);

// Businesses.del
server.del(
  '/v1/businesses/:id'
, middleware.auth.allow('admin')
, routes.del
);

// Businesses.create
server.post(
  '/v1/businesses'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.create
);

// Businesses.update
server.patch(
  '/v1/businesses/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.update
);

// Businesses.update
server.post(
  '/v1/businesses/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.validate(schema)
, middleware.fields(fields)
, routes.update
);

// Businesses.listWithLocations - STUPID METHOD
server.get(
  '/v1/businessesWithLocations'
, middleware.auth.allow('admin', 'sales')
, routes.listWithLocations
);

module.exports = server;