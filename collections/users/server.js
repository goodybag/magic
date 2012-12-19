/**
 * Users server
 */

var server     = require('express')();
var middleware = require('../../middleware');
var routes     = require('./routes');
var validators = require('./validators');
var fields     = require('./auth/fields');

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
, middleware.validate(validators.create)
, routes.create
);

// Users.create
server.post(
  '/v1/users/:id'
, middleware.validate(validators.update)
, routes.update
);

// Users.delete
server.del(
  '/v1/users/:id'
, middleware.auth.allow('admin')
, routes.del
);

module.exports = server;