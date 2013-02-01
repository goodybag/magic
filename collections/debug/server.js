/**
 * Debug server
 */

var server = require('express')();
var routes = require('./routes');

server.get(
  '/v1/debug/profile'
, routes.getProfilerData
);

server.post(
  '/v1/debug/profile'
, routes.updateProfilerSettings
);

module.exports = server;
