/**
 * Events server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');

// Events.list
server.get(
  '/v1/events'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
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