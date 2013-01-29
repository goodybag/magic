/**
 * Loyalty Stats server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.userLoyaltyStats;
var routes = require('./routes');
var fields = require('./fields');
var perms  = require('./permissions');

// LoyaltyStats.get
server.get(
  '/v1/loyaltyStats'
, middleware.permissions(perms.employee)
, middleware.fields(fields.access)
, routes.get
);

// LoyaltyStats.update
server.post(
  '/v1/loyaltyStats'
, middleware.validate.body(null, { businessId:{isInt:[]}, consumerId:{isInt:[]}, deltaPunches:{isInt:[]}})
, middleware.permissions(perms.employee)
, middleware.auth.allow('admin', 'sales', 'employee')
, middleware.fields(fields.mutate)
, routes.update
);

module.exports = server;