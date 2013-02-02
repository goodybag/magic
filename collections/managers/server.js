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
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, routes.list
);

// managers.get
server.get(
  '/v1/managers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.permissions(permissions)
, routes.get
);

// managers.create
server.post(
  '/v1/managers'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.create
);

// managers.update
server.put(
  '/v1/managers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// managers.update
server.post(
  '/v1/managers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// managers.delete
server.del(
  '/v1/managers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, routes.del
);

module.exports = server;