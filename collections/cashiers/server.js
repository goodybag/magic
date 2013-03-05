/**
 * cashiers server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');
var schema      = require('../../db').schemas.cashiers;
var perms       = require('./permissions');
var applyGroups = require('./apply-groups');
var desc        = require('./description.yaml')

// cashiers.list
server.get(
  '/v1/cashiers'
, middleware.profile('GET /v1/cashiers', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(perms)
, middleware.profile('list cashiers handler')
, routes.list
);

// cashiers.get
server.get(
  '/v1/cashiers/:id'
, middleware.profile('GET /v1/cashiers/:id')
, middleware.profile('apply groups cashiers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.profile('permissions')
, middleware.permissions(perms)
, middleware.profile('get cashier handler')
, routes.get
);

// cashiers.create
server.post(
  '/v1/cashiers'
, middleware.profile('POST /v1/cashiers')
, middleware.profile('apply groups cashiers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(perms)
, middleware.profile('create cashier handler')
, routes.create
);

// cashiers.update
server.put(
  '/v1/cashiers/:id'
, middleware.profile('PUT /v1/cashiers/:id')
, middleware.profile('apply groups cashiers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(perms)
, middleware.profile('update cashier handler')
, routes.update
);

// cashiers.update
server.post(
  '/v1/cashiers/:id'
, middleware.profile('POST /v1/cashiers/:id')
, middleware.profile('apply groups cashiers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(perms)
, middleware.profile('update cashier handler')
, routes.update
);

// cashiers.delete
server.del(
  '/v1/cashiers/:id'
, middleware.profile('DELETE /v1/cashiers/:id')
, middleware.profile('apply groups cashiers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.profile('delete cashier handler')
, routes.del
);

module.exports = server;