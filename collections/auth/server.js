/**
 * Sessions server
 */

var server = require('express')();
var routes = require('./routes');

server.get(
  '/v1/session'
, routes.session
);

server.post(
  '/v1/session'
, routes.authenticate
);

/*
server.post(
  '/v1/oauth-session'
, routes.oauthAuthenticate
);
*/

server.del(
  '/v1/session'
, routes.logout
);

module.exports = server;
