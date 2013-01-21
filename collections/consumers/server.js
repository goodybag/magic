/**
 * consumers server
 */

var server     = require('express')();
var middleware = require('../../middleware');
var routes     = require('./routes');
var schema     = require('../../db').schemas.consumers;
var fields     = require('./fields');
var perms      = require('./permissions');

// consumers.list
server.get(
  '/v1/consumers'
, middleware.fields(fields)
, routes.list
);

// consumers.get
server.get(
  '/v1/consumers/:id'
, middleware.permissions(perms.owner)
, middleware.fields(fields)
, routes.get
);

// consumers.create
server.post(
  '/v1/consumers'
, middleware.permissions(perms.owner)
, middleware.fields(fields)
, middleware.validate(schema)
, routes.create
);

// consumers.update
server.patch(
  '/v1/consumers/:id'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'owner')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.update
);

// consumers.update
server.post(
  '/v1/consumers/:id'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'owner')
, middleware.fields(fields)
, middleware.validate(schema)
, routes.update
);

// consumers.delete
server.del(
  '/v1/consumers/:id'
, middleware.permissions(perms.owner)
, middleware.auth.allow('admin', 'owner')
, routes.del
);

module.exports = server;