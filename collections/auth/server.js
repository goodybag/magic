  /**
 * Sessions server
 */

var server = require('express')();
var routes = require('./routes');
var middleware  = require('../../middleware');
var desc = require('./description');

server.get(
  '/v1/session'
, middleware.profile('GET /v1/session')
, middleware.profile('get session handler')
, routes.session
);

server.post(
  '/v1/session'
, middleware.profile('POST /v1/session')
, middleware.profile('create session handler')
, middleware.validate2.body(desc.session.methods.post.body)
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
, middleware.profile('DELETE /v1/session')
, middleware.profile('delete session handler')
, routes.logout
);

server.post(
  '/v1/oauth'
, middleware.profile('POST /v1/oauth')
, middleware.profile('oauth authenticate handler')
, routes.oauthAuthenticate
);

server.get(
  '/v1/oauth'
, middleware.profile('GET /v1/oauth')
, middleware.profile('oauth get handler')
, routes.getOauthUrl
);

module.exports = server;
