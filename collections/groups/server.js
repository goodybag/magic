/**
 * Groups server
 */

var server     = require('express')();
var middleware = require('../../middleware');
var routes     = require('./routes');
var schema     = require('../../db').schemas.groups;
var fields     = require('./fields');

// Groups.list
server.get(
  '/v1/groups'
, middleware.fields(fields)
, routes.list
);

// Groups.get
server.get(
  '/v1/groups/:id'
, middleware.fields(fields)
, routes.get
);

// Groups.create
server.post(
  '/v1/groups'
, middleware.fields(fields)
, middleware.validate.body(schema)
, routes.create
);

// Groups.update
server.patch(
  '/v1/groups/:id'
, middleware.fields(fields)
, middleware.validate.body(schema)
, routes.update
);

// Groups.update
server.post(
  '/v1/groups/:id'
, middleware.fields(fields)
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