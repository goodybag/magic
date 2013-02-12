/**
 * managers server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');
var schema      = require('../../db').schemas.managers;
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');

// managers.list
server.get(
  '/v1/managers'
, middleware.profile('GET /v1/managers', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list managers handler')
, routes.list
);

// managers.get
server.get(
  '/v1/managers/:id'
, middleware.profile('GET /v1/managers/:id')
, middleware.profile('apply groups managers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get manager handler')
, routes.get
);

// managers.create
server.post(
  '/v1/managers'
, middleware.profile('POST /v1/managers')
, middleware.profile('apply groups managers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('create manager handler')
, routes.create
);

// managers.update
server.put(
  '/v1/managers/:id'
, middleware.profile('PUT /v1/managers/:id')
, middleware.profile('apply groups managers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update manager handler')
, routes.update
);

// managers.update
server.post(
  '/v1/managers/:id'
, middleware.profile('POST /v1/managers/:id')
, middleware.profile('apply groups managers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update manager handler')
, routes.update
);

// managers.delete
server.del(
  '/v1/managers/:id'
, middleware.profile('DELETE /v1/managers/:id')
, middleware.profile('apply groups managers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.profile('delete manager handler')
, routes.del
);

module.exports = server;