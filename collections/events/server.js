/**
 * Events server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');

// Events.list
server.get(
  '/v1/events'
, middleware.auth.allow('admin')
, routes.list
);

// Events.get
server.get(
  '/v1/events/:id'
, middleware.auth.allow('admin')
, routes.get
);

module.exports = server;