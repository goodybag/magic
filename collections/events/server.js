/**
 * Events server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');
var desc        = require('./description.yaml');

// Events.list
server.get(
  '/v1/events'
, middleware.profile('GET /v1/events', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
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