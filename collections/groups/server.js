/**
 * Groups server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');
var permissions = require('./permissions');
var desc        = require('./description')

// Groups.list
server.get(
  '/v1/groups'
, middleware.profile('GET /v1/groups', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('auth allow')
, middleware.auth.allow('admin')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list groups handler')
, routes.list
);

// Groups.get
server.get(
  '/v1/groups/:id'
, middleware.profile('auth allow')
, middleware.auth.allow('admin')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get group handler')
, routes.get
);

// Groups.create
server.post(
  '/v1/groups'
, middleware.profile('auth allow')
, middleware.auth.allow('admin')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create group handler')
, routes.create
);

// Groups.update
server.put(
  '/v1/groups/:id'
, middleware.profile('auth allow')
, middleware.auth.allow('admin')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update group handler')
, routes.update
);

// Groups.update
server.post(
  '/v1/groups/:id'
, middleware.profile('auth allow')
, middleware.auth.allow('admin')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update group handler')
, routes.update
);

// Groups.delete
server.del(
  '/v1/groups/:id'
, middleware.profile('auth allow')
, middleware.auth.allow('admin')
, middleware.profile('delete group handler')
, routes.del
);

module.exports = server;