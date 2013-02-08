/**
 * activity server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');

// activity.list
server.get(
  '/v1/activity'
, routes.list
);

// consumer.activity
server.get(
  '/v1/consumers/:consumerId/activity'
, routes.list
);

// activity.get
server.get(
  '/v1/activity/:id'
, routes.get
);


module.exports = server;