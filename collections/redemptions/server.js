/**
 * Redemptions server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');
var desc = require('./description')

// Redemptions.list
server.get(
  '/v1/redemptions'
, middleware.profile('GET /v1/redemptions', ['limit'])
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('list redemptions handler')
, routes.list
);

// Redemptions.create
server.post(
  '/v1/redemptions'
, middleware.profile('POST /v1/redemptions')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('apply groups redemptions locationEmployee')
, middleware.applyGroups(applyGroups.locationEmployee)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'locationEmployee')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create redemption handler')
, routes.create
);

module.exports = server;