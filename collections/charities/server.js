/**
 * Charities server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var schema      = require('../../db').schemas.charities;
var permissions = require('./permissions');
var routes      = require('./routes');

// Charities.list
server.get(
  '/v1/charities'
, middleware.profile('GET /v1/charities', ['limit'])
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
, middleware.validate.body(schema)
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
, middleware.validate.body(schema)
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
, middleware.validate.body(schema)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update charity handler')
, routes.update
);

module.exports = server;