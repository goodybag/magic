/**
 * Charities server
 */

var server     = require('express')();
var middleware = require('../../middleware');
var schema     = require('../../db').schemas.charities;
var fields     = require('./fields');
var routes     = require('./routes');

// Charities.list
server.get(
  '/v1/charities'
, middleware.fields(fields.access)
, routes.list
);

// Charities.get
server.get(
  '/v1/charities/:id'
, middleware.fields(fields.access)
, routes.get
);

// Charities.del
server.del(
  '/v1/charities/:id'
, middleware.auth.allow('admin')
, routes.del
);

// Charities.create
server.post(
  '/v1/charities'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields.create)
, middleware.validate(schema)
, routes.create
);

// Charities.update
server.patch(
  '/v1/charities/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields.mutate)
, middleware.validate(schema)
, routes.update
);

// Charities.update
server.post(
  '/v1/charities/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.validate(schema)
, middleware.fields(fields.mutate)
, routes.update
);

module.exports = server;