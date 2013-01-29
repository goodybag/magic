/**
 * Photos server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.photos;
var routes = require('./routes');
var permissions = require('./permissions');

// Photos.list
server.get(
  '/v1/photos'
, middleware.permissions(permissions)
, routes.list
);

// Photos.list
server.get(
  '/v1/businesses/:businessId/photos'
, middleware.permissions(permissions)
, routes.list
);

// Photos.list
server.get(
  '/v1/products/:productId/photos'
, middleware.permissions(permissions)
, routes.list
);

// Photos.create
server.post(
  '/v1/photos'
, middleware.validate.body(schema)
, middleware.permissions(permissions)
, routes.create
);

// Photos.get
server.get(
  '/v1/photos/:photoId'
, middleware.permissions(permissions)
, routes.get
);

// Photos.update
server.patch(
  '/v1/photos/:photoId'
, middleware.validate.body(schema)
, middleware.permissions(permissions)
, routes.update
);

// Photos.update
server.post(
  '/v1/photos/:photoId'
, middleware.validate.body(schema)
, middleware.permissions(permissions)
, routes.update
);

// Photos.delete
server.del(
  '/v1/photos/:photoId'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

module.exports = server;