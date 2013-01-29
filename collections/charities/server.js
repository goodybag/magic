/**
 * Charities server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var schema      = require('../../db').schemas.charities;
var permissions = require('./permissions');
var routes      = require('./routes');

// Charities.list
server.get(
  '/v1/charities'
, middleware.permissions(permissions)
, routes.list
);

// Charities.get
server.get(
  '/v1/charities/:id'
, middleware.permissions(permissions)
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
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.create
);

// Charities.update
server.patch(
  '/v1/charities/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// Charities.update
server.post(
  '/v1/charities/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.validate.body(schema)
, middleware.permissions(permissions)
, routes.update
);

module.exports = server;