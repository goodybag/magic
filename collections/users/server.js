/**
 * Users server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');
var schema      = require('../../db').schemas.users;
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');
var desc        = require('./description.yaml');

// Users.createCardUpdate
server.post(
  '/v1/users/card-updates'
, middleware.profile('POST /v1/users/card-updates')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'tapin-station')
, middleware.profile('validate body')
, middleware.validate2.body(desc.cardUpdatesCollection.methods.post.body)
, middleware.profile('create card update handler')
, routes.createCardUpdate
);

// Users.updateCard
server.post(
  '/v1/users/card-updates/:token'
, middleware.profile('POST /v1/users/card-updates/:token')
, middleware.profile('update card handler')
, routes.updateCard
);

// Users.getCardUpdate
server.get(
  '/v1/users/card-updates/:token'
, middleware.profile('get /v1/users/card-updates/:token')
, middleware.profile('get card update handler')
, routes.getCardUpdate
);

// Users.deleteCardUpdate
server.del(
  '/v1/users/card-updates/:token'
, middleware.profile('DELETE /v1/users/card-updates/:token')
, middleware.profile('del card update handler')
, routes.deleteCardUpdate
);

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

// Users.getPartialRegistrationEmail
server.get(
  '/v1/users/complete-registration/:token'
, middleware.profile('GET /v1/users/complete-registration/:token')
, middleware.profile('get partial registration email handler')
, middleware.validate2.query(desc.completeRegistration.methods.get.query)
, routes.getPartialRegistrationEmail
);

// Users.completeRegistration
server.post(
  '/v1/users/complete-registration/:token'
, middleware.profile('POST /v1/users/complete-registration/:token')
, middleware.profile('complete partial registration handler')
, middleware.validate2.body(desc.completeRegistration.methods.post.body)
, routes.completeRegistration
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
, middleware.validate2.query(desc.collection.methods.get.query)
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
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
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
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
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
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
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
