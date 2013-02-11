/**
 * Events server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');

// Events.list
server.get(
  '/v1/events'
, middleware.profile('GET /v1/events', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('auth allow')
, middleware.auth.allow('admin')
, middleware.profile('list events handler')
, routes.list
);

// Events.get
server.get(
  '/v1/events/:id'
, middleware.profile('GET /v1/events/:id')
, middleware.profile('auth allow')
, middleware.auth.allow('admin')
, middleware.profile('get event handler')
, routes.get
);

module.exports = server;