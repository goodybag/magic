/**
 * Photos server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.photos;
var routes = require('./routes');
var fields = require('./fields');

// Photos.list
server.get(
  '/v1/photos'
, middleware.fields(fields.get)
, routes.list
);

// Photos.list
server.get(
  '/v1/businesses/:businessId/photos'
, middleware.fields(fields.get)
, routes.list
);

// Photos.list
server.get(
  '/v1/products/:productId/photos'
, middleware.fields(fields.get)
, routes.list
);

// Photos.create
server.post(
  '/v1/photos'
, middleware.validate(schema)
, middleware.fields(fields.create)
, routes.create
);

// Photos.get
server.get(
  '/v1/photos/:photoId'
, middleware.fields(fields.get)
, routes.get
);

// Photos.update
server.patch(
  '/v1/photos/:photoId'
, middleware.validate(schema)
, middleware.fields(fields.modify)
, routes.update
);

// Photos.update
server.post(
  '/v1/photos/:photoId'
, middleware.validate(schema)
, middleware.fields(fields.modify)
, routes.update
);

// Photos.delete
server.del(
  '/v1/photos/:photoId'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

module.exports = server;