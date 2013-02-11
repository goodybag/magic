/**
 * activity server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');

// activity.list
server.get(
  '/v1/activity'
, middleware.profile('GET /v1/activity')
, middleware.profile('list activity handler')
, routes.list
);

// consumer.activity
server.get(
  '/v1/consumers/:consumerId/activity'
, middleware.profile('GET /v1/consumers/:consumerId/activity')
, middleware.profile('list activity handler')
, routes.list
);

// activity.get
server.get(
  '/v1/activity/:id'
, middleware.profile('GET /v1/activity/:id')
, middleware.profile('get activity handler')
, routes.get
);


module.exports = server;