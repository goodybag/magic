/**
 * Users server
 */

var server     = require('express')();
var middleware = require('../../middleware');
var routes     = require('./routes');
var schema     = require('../../db').schemas.users;
var fields     = require('./fields');
var perms      = require('./permissions');

// Users.list
server.get(
  '/v1/users'
, middleware.fields(fields.access)
, routes.list
);

// Users.get
server.get(
  '/v1/users/:id'
, middleware.applyGroups(perms.owner)
, middleware.fields(fields.access)
, routes.get
);

// Users.create
server.post(
  '/v1/users'
, middleware.applyGroups(perms.owner)
, middleware.fields(fields.create)
, middleware.validate.body(schema)
, routes.create
);

// Users.update
server.patch(
  '/v1/users/:id'
, middleware.applyGroups(perms.owner)
, middleware.auth.allow('admin', 'owner')
, middleware.fields(fields.mutate)
, middleware.validate.body(schema)
, routes.update
);

// Users.update
server.post(
  '/v1/users/:id'
, middleware.applyGroups(perms.owner)
, middleware.auth.allow('admin', 'owner')
, middleware.fields(fields.mutate)
, middleware.validate.body(schema)
, routes.update
);

// Users.delete
server.del(
  '/v1/users/:id'
, middleware.applyGroups(perms.owner)
, middleware.auth.allow('admin', 'owner')
, routes.del
);

module.exports = server;