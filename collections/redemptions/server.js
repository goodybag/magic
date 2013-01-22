/**
 * Redemptions server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.userRedemptions;
var routes = require('./routes');
var fields = require('./fields');
var perms  = require('./permissions');

// Redemptions.list
server.get(
  '/v1/redemptions'
, middleware.fields(fields.access)
, routes.list
);

// Redemptions.create
server.post(
  '/v1/redemptions'
, middleware.validate(schema, { deltaPunches:{ isInt:[] }})
, middleware.permissions(perms.locationEmployee)
, middleware.auth.allow('locationEmployee')
, middleware.fields(fields.create)
, routes.create
);

module.exports = server;