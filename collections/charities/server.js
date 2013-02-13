/**
 * Charities server
 */

require('js-yaml');
var server      = require('express')();
var middleware  = require('../../middleware');
var permissions = require('./permissions');
var routes      = require('./routes');
var desc        = require('./description.yaml');

// Charities.list
server.get(
  '/v1/charities'
, middleware.profile('GET /v1/charities', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list charities handler')
, routes.list
);

// Charities.get
server.get(
  '/v1/charities/:id'
, middleware.profile('GET /v1/charities/:id')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get charity handler')
, routes.get
);

// Charities.del
server.del(
  '/v1/charities/:id'
, middleware.profile('DELETE /v1/charities/:id')
, middleware.profile('auth allow')
, middleware.auth.allow('admin')
, middleware.profile('delete charity handler')
, routes.del
);

// Charities.create
server.post(
  '/v1/charities'
, middleware.profile('POST /v1/charities')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('create charity handler')
, routes.create
);

// Charities.update
server.put(
  '/v1/charities/:id'
, middleware.profile('PUT /v1/charities/:id')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('update charity handler')
, routes.update
);

// Charities.update
server.post(
  '/v1/charities/:id'
, middleware.profile('POST /v1/charities/:id')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update charity handler')
, routes.update
);

module.exports = server;