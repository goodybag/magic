/**
 * Redemptions server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.redemptions;
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
, middleware.permissions(perms.cashier)
, middleware.auth.allow('cashier')
, middleware.fields(fields.create)
, middleware.validate(schema)
, routes.create
);

module.exports = server;