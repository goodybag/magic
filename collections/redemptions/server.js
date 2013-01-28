/**
 * Redemptions server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.userRedemptions;
var routes = require('./routes');
var fields = require('./fields');
var applyGroups = require('apply-groups');

// Redemptions.list
server.get(
  '/v1/redemptions'
, middleware.fields(fields.access)
, routes.list
);

// Redemptions.create
server.post(
  '/v1/redemptions'
, middleware.validate.body(schema, { deltaPunches:{ isInt:[] }})
, middleware.applyGroups(applyGroups.locationEmployee)
, middleware.auth.allow('locationEmployee')
, middleware.fields(fields.create)
, routes.create
);

module.exports = server;