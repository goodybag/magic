/**
 * Users server
 */

var server     = require('express')();
var middleware = require('../../middleware');
var routes     = require('./routes');
var schema     = require('../../db').schemas.users;
var fields     = require('./fields');

// Users.list
server.get(
  '/v1/users'
, middleware.fields(fields)
, routes.list
);

// Users.get
server.get(
  '/v1/users/:id'
, middleware.fields(fields)
, routes.get
);

// Users.create
server.post(
  '/v1/users'
, middleware.fields(fields)
, middleware.validate(schema)
, routes.create
);

// Users.update
server.patch(
  '/v1/users/:id'
, middleware.fields(fields)
, middleware.validate(schema)
, routes.update
);

// Users.update
server.post(
  '/v1/users/:id'
, middleware.fields(fields)
, middleware.validate(schema)
, routes.update
);

// Users.delete
server.del(
  '/v1/users/:id'
, middleware.auth.allow('admin')
, routes.del
);

module.exports = server;