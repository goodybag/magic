/**
 * Loyalty Stats server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.userLoyaltyStats;
var routes = require('./routes');
var fields = require('./fields');
var applyGroups = require('./apply-groups');

// LoyaltyStats.get
server.get(
  '/v1/loyaltyStats'
, middleware.applyGroups(applyGroups.owner)
, middleware.fields(fields.access)
, routes.get
);

// LoyaltyStats.update
server.post(
  '/v1/loyaltyStats'
, middleware.validate.body(null, { businessId:{isInt:[]}, consumerId:{isInt:[]}, deltaPunces:{isInt:[]}})
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.fields(fields.mutate)
, routes.update
);

module.exports = server;