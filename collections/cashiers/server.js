/**
 * cashiers server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');
var schema      = require('../../db').schemas.cashiers;
var perms       = require('./permissions');
var applyGroups = require('./apply-groups');

// cashiers.list
server.get(
  '/v1/cashiers'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(perms)
, routes.list
);

// cashiers.get
server.get(
  '/v1/cashiers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.permissions(perms)
, routes.get
);

// cashiers.create
server.post(
  '/v1/cashiers'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(perms)
, middleware.validate.body(schema)
, routes.create
);

// cashiers.update
server.patch(
  '/v1/cashiers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.permissions(perms)
, middleware.validate.body(schema)
, routes.update
);

// cashiers.update
server.post(
  '/v1/cashiers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.permissions(perms)
, middleware.validate.body(schema)
, routes.update
);

// cashiers.delete
server.del(
  '/v1/cashiers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, routes.del
);

module.exports = server;