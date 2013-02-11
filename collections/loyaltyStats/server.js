/**
 * Loyalty Stats server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.userLoyaltyStats;
var routes = require('./routes');
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');

// LoyaltyStats.get
server.get(
  '/v1/loyalty'
, middleware.profile('GET /v1/loyalty')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'consumer', 'employee')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get loyaltyStats handler')
, routes.get
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
, routes.getOne
);

// LoyaltyStats.update
server.put(
  '/v1/loyalty/:loyaltyId'
, middleware.profile('PUT /v1/loyalty/:loyaltyId')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'employee')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(null, { locationId:{isInt:[]}, deltaPunches:{isInt:[]}})
, middleware.profile('update loyaltyStats handler')
, routes.update
);

// LoyaltyStats.get
server.get(
  '/v1/consumers/:consumerId/loyalty'
, middleware.profile('GET /v1/consumers/:consumerId/loyalty')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get loyaltyStats handler')
, routes.get
);

// LoyaltyStats.get
server.get(
  '/v1/consumers/:consumerId/loyalty/:businessId'
, middleware.profile('GET /v1/consumers/:consumerId/loyalty/:businessId')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('getOne loyaltyStats handler')
, routes.get
);

// LoyaltyStats.get
server.get(
  '/v1/loyalty/businesses/:businessId'
, middleware.profile('GET /v1/loyalty/businesses/:businessId')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('getOne loyaltyStats handler')
, routes.get
);

// LoyaltyStats.update
server.put(
  '/v1/consumers/:consumerId/loyalty/:businessId'
, middleware.profile('PUT /v1/consumers/:consumerId/loyalty/:businessId')
, middleware.profile('apply groups loyaltyStats employee')
, middleware.applyGroups(applyGroups.employee)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'employee')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(null, { locationId:{isInt:[]}, deltaPunches:{isInt:[]}})
, middleware.profile('update loyaltyStats handler')
, routes.update
);

module.exports = server;