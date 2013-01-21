/**
 * cashiers server
 */

var server     = require('express')();
var middleware = require('../../middleware');
var routes     = require('./routes');
var schema     = require('../../db').schemas.cashiers;
var fields     = require('./fields');
var perms      = require('./permissions');

// cashiers.list
server.get(
  '/v1/cashiers'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, routes.list
);

// cashiers.get
server.get(
  '/v1/cashiers/:id'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.fields(fields)
, routes.get
);

// cashiers.create
server.post(
  '/v1/cashiers'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.create
);

// cashiers.update
server.patch(
  '/v1/cashiers/:id'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.update
);

// cashiers.update
server.post(
  '/v1/cashiers/:id'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.update
);

// cashiers.delete
server.del(
  '/v1/cashiers/:id'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, routes.del
);

module.exports = server;