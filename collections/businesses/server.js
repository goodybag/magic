/**
 * Businesses server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var validators = require('./schema/validators');
var fields = require('./auth/fields');

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
, routes.del
);

// Businesses.create
server.post(
  '/v1/businesses'
, middleware.validate(validators.create)
, routes.create
);

// Businesses.update
server.put(
  '/v1/businesses/:id'
, middleware.validate(validators.update)
, routes.update
);

// Businesses.update
server.patch(
  '/v1/businesses/:id'
, middleware.validate(validators.update)
, routes.update
);

// Businesses.update
server.post(
  '/v1/businesses/:id'
, middleware.validate(validators.update)
, routes.update
);

// Businesses.listWithLocations - STUPID METHOD
server.get(
  '/v1/businessesWithLocations'
, routes.listWithLocations
);

module.exports = server;