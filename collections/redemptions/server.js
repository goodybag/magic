/**
 * Redemptions server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.userRedemptions;
var routes = require('./routes');
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');

// Redemptions.list
server.get(
  '/v1/redemptions'
, middleware.permissions(permissions)
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, routes.list
);

// Redemptions.create
server.post(
  '/v1/redemptions'
, middleware.validate.body(schema, { deltaPunches:{ isInt:[] }})
, middleware.applyGroups(applyGroups.locationEmployee)
, middleware.auth.allow('locationEmployee')
, middleware.permissions(permissions)
, routes.create
);

module.exports = server;