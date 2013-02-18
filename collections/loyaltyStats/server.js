/**
 * Loyalty Stats server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');
var desc = require('./description')

// LoyaltyStats.list
server.get(
  '/v1/loyalty'
, middleware.profile('GET /v1/loyalty')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'consumer', 'employee')
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get loyaltyStats handler')
, routes.list
);

// LoyaltyStats.list
server.get(
  '/v1/consumers/:userId/loyalty'
, middleware.profile('GET /v1/consumers/:userId/loyalty')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get loyaltyStats handler')
, routes.list
);

// LoyaltyStats.list
server.get(
  '/v1/consumers/:userId/loyalty/:businessId'
, middleware.profile('GET /v1/consumers/:userId/loyalty/:businessId')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('getOne loyaltyStats handler')
, routes.list
);

// LoyaltyStats.list
server.get(
  '/v1/loyalty/businesses/:businessId'
, middleware.profile('GET /v1/loyalty/businesses/:businessId')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('getOne loyaltyStats handler')
, routes.list
);

// LoyaltyStats.get
server.get(
  '/v1/loyalty/:loyaltyId'
, middleware.profile('GET /v1/loyalty/:loyaltyId')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'consumer', 'employee')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('getOne loyaltyStats handler')
, routes.get
);

// LoyaltyStats.update
server.put(
  '/v1/loyalty/:loyaltyId'
, middleware.profile('PUT /v1/loyalty/:loyaltyId')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'employee')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update loyaltyStats handler')
, routes.update
);

// LoyaltyStats.update
server.put(
  '/v1/consumers/:userId/loyalty/:businessId'
, middleware.profile('PUT /v1/consumers/:userId/loyalty/:businessId')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'employee')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update loyaltyStats handler')
, routes.update
);

module.exports = server;