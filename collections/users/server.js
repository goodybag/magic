/**
 * Users server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');
var schema      = require('../../db').schemas.users;
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');

// Users.createPasswordReset
server.post(
  '/v1/users/password-reset'
, middleware.profile('POST /v1/users/password-reset')
, middleware.profile('create user password reset handler')
, routes.createPasswordReset
);

// Users.resetPassword
server.post(
  '/v1/users/password-reset/:token'
, middleware.profile('POST /v1/users/password-reset/:token')
, middleware.profile('reset user password handler')
, routes.resetPassword
);

// Users.list
server.get(
  '/v1/users'
, middleware.profile('GET /v1/users', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list users handler')
, routes.list
);

// Users.get
server.get(
  '/v1/users/:id'
, middleware.profile('GET /v1/users/:id')
, middleware.profile('apply groups users owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get user handler')
, routes.get
);

// Users.create
server.post(
  '/v1/users'
, middleware.profile('POST /v1/users')
, middleware.profile('apply groups users owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('create user handler')
, routes.create
);

// Users.update
server.put(
  '/v1/users/:id'
, middleware.profile('PUT /v1/users/:id')
, middleware.profile('apply groups users owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update user handler')
, routes.update
);

// Users.update
server.post(
  '/v1/users/:id'
, middleware.profile('POST /v1/users/:id')
, middleware.profile('apply groups users owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update user handler')
, routes.update
);

// Users.delete
server.del(
  '/v1/users/:id'
, middleware.profile('DELETE /v1/users/:id')
, middleware.profile('apply groups users owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('delete user handler')
, routes.del
);

module.exports = server;