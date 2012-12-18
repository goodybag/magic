/**
 * Locations server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var validators = require('./validators');
var fields = require('./auth/fields');

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
, middleware.validate(validators.create)
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
, middleware.validate(validators.update)
, routes.update
);

// Locations.update
server.put(
  '/v1/locations/:locationId'
, middleware.validate(validators.update)
, routes.update
);

// Locations.update
server.post(
  '/v1/locations/:locationId'
, middleware.validate(validators.update)
, routes.update
);

// Locations.delete
server.del(
  '/v1/locations/:locationId'
, routes.del
);

module.exports = server;