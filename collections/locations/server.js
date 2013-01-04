/**
 * Locations server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.locations;
var routes = require('./routes');
var fields = require('./fields');

// Locations.list
server.get(
  '/v1/locations'
, middleware.fields(fields)
, routes.list
);

// Locations.list
server.get(
  '/v1/businesses/:businessId/locations'
, middleware.fields(fields)
, routes.list
);

// Locations.create
server.post(
  '/v1/locations'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.create
);

// Locations.get
server.get(
  '/v1/locations/:locationId'
, middleware.fields(fields)
, routes.get
);

// Locations.update
server.patch(
  '/v1/locations/:locationId'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.update
);

// Locations.update
server.post(
  '/v1/locations/:locationId'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.update
);

// Locations.delete
server.del(
  '/v1/locations/:locationId'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

module.exports = server;