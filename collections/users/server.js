/**
 * Users server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');
var schema      = require('../../db').schemas.users;
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');

// Users.list
server.get(
  '/v1/users'
, middleware.permissions(permissions)
, routes.list
);

// Users.get
server.get(
  '/v1/users/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.permissions(permissions)
, routes.get
);

// Users.create
server.post(
  '/v1/users'
, middleware.applyGroups(applyGroups.owner)
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.create
);

// Users.update
server.put(
  '/v1/users/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'owner')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// Users.update
server.post(
  '/v1/users/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'owner')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// Users.delete
server.del(
  '/v1/users/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'owner')
, routes.del
);

module.exports = server;