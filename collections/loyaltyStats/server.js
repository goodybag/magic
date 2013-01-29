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
  '/v1/loyaltyStats'
, middleware.applyGroups(applyGroups.owner)
, middleware.permissions(permissions)
, routes.get
);

// LoyaltyStats.update
server.post(
  '/v1/loyaltyStats'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.permissions(permissions)
, middleware.validate.body(null, { businessId:{isInt:[]}, consumerId:{isInt:[]}, deltaPunches:{isInt:[]}})
, routes.update
);

module.exports = server;