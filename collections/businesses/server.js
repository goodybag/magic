/**
 * Businesses server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var schema      = require('../../db').schemas.businesses;
var permissions = require('./permissions');
var routes      = require('./routes');

// Businesses.list
server.get(
  '/v1/businesses'
, middleware.permissions(permissions)
, routes.list
);

// Businesses.get
server.get(
  '/v1/businesses/:id'
, middleware.permissions(permissions)
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
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.create
);

// Businesses.update
server.patch(
  '/v1/businesses/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// Businesses.listWithLocations - STUPID METHOD
server.get(
  '/v1/businessesWithLocations'
, middleware.auth.allow('admin', 'sales')
, routes.listWithLocations
);

module.exports = server;