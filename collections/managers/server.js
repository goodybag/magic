/**
 * managers server
 */

var server     = require('express')();
var middleware = require('../../middleware');
var routes     = require('./routes');
var schema     = require('../../db').schemas.managers;
var fields     = require('./fields');
var perms      = require('./permissions');

// managers.list
server.get(
  '/v1/managers'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, routes.list
);

// managers.get
server.get(
  '/v1/managers/:id'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.fields(fields)
, routes.get
);

// managers.create
server.post(
  '/v1/managers'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.create
);

// managers.update
server.patch(
  '/v1/managers/:id'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.update
);

// managers.update
server.post(
  '/v1/managers/:id'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.update
);

// managers.delete
server.del(
  '/v1/managers/:id'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, routes.del
);

module.exports = server;