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
, middleware.profile('GET /v1/redemptions', ['limit'])
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('list redemptions handler')
, routes.list
);

// Redemptions.create
server.post(
  '/v1/redemptions'
, middleware.profile('POST /v1/redemptions')
, middleware.profile('validate body')
, middleware.validate.body(schema, { deltaPunches:{ isInt:[] }})
, middleware.profile('apply groups redemptions locationEmployee')
, middleware.applyGroups(applyGroups.locationEmployee)
, middleware.profile('auth allow')
, middleware.auth.allow('locationEmployee')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create redemption handler')
, routes.create
);

module.exports = server;