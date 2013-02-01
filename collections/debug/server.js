/**
 * Debug server
 */

var server = require('express')();
var routes = require('./routes');

server.get(
  '/v1/debug/profile'
, routes.profile
);

module.exports = server;
