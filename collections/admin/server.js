/**
 * Admin server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');

server.get(
  '/v1/admin/algorithms/popular'
, middleware.auth.allow('admin', 'sales')
, routes.getRebuildPopularListInterface
);

server.post(
  '/v1/admin/algorithms/popular'
, middleware.auth.allow('admin', 'sales')
, routes.rebuildPopularList
);

server.get(
  '/v1/admin/algorithms/nearby'
, middleware.auth.allow('admin', 'sales')
, routes.getRebuildNearbyGridInterface
);

server.post(
  '/v1/admin/algorithms/nearby'
, middleware.auth.allow('admin', 'sales')
, routes.rebuildNearbyGrid
);

module.exports = server;
