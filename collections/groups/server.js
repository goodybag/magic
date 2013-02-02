/**
 * Groups server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');
var schema      = require('../../db').schemas.groups;
var permissions = require('./permissions');

// Groups.list
server.get(
  '/v1/groups'
, middleware.auth.allow('admin')
, middleware.permissions(permissions)
, routes.list
);

// Groups.get
server.get(
  '/v1/groups/:id'
, middleware.auth.allow('admin')
, middleware.permissions(permissions)
, routes.get
);

// Groups.create
server.post(
  '/v1/groups'
, middleware.auth.allow('admin')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.create
);

// Groups.update
server.put(
  '/v1/groups/:id'
, middleware.auth.allow('admin')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// Groups.update
server.post(
  '/v1/groups/:id'
, middleware.auth.allow('admin')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// Groups.delete
server.del(
  '/v1/groups/:id'
, middleware.auth.allow('admin')
, routes.del
);

module.exports = server;