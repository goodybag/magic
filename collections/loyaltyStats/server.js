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
, middleware.applyGroups(applyGroups.employee)
, middleware.auth.allow('admin', 'sales', 'consumer', 'employee')
, middleware.permissions(permissions)
, routes.get
);

// LoyaltyStats.get
server.get(
  '/v1/loyalty/:loyaltyId'
, middleware.applyGroups(applyGroups.employee)
, middleware.auth.allow('admin', 'sales', 'consumer', 'employee')
, middleware.permissions(permissions)
, routes.getOne
);

// LoyaltyStats.update
server.put(
  '/v1/loyalty/:loyaltyId'
, middleware.applyGroups(applyGroups.employee)
, middleware.auth.allow('admin', 'sales', 'employee')
, middleware.permissions(permissions)
, middleware.validate.body(null, { locationId:{isInt:[]}, deltaPunches:{isInt:[]}})
, routes.update
);

// LoyaltyStats.get
server.get(
  '/v1/consumers/:consumerId/loyalty'
, middleware.applyGroups(applyGroups.employee)
, middleware.permissions(permissions)
, routes.get
);

// LoyaltyStats.get
server.get(
  '/v1/consumers/:consumerId/loyalty/:businessId'
, middleware.applyGroups(applyGroups.employee)
, middleware.permissions(permissions)
, routes.get
);

// LoyaltyStats.get
server.get(
  '/v1/loyalty/businesses/:businessId'
, middleware.applyGroups(applyGroups.employee)
, middleware.permissions(permissions)
, routes.get
);

// LoyaltyStats.update
server.put(
  '/v1/consumers/:consumerId/loyalty/:businessId'
, middleware.applyGroups(applyGroups.employee)
, middleware.auth.allow('admin', 'sales', 'employee')
, middleware.permissions(permissions)
, middleware.validate.body(null, { locationId:{isInt:[]}, deltaPunches:{isInt:[]}})
, routes.update
);

module.exports = server;