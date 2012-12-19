/**
 * Photos server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var validators = require('./validators');
var fields = require('./auth/fields');

// Photos.list
server.get(
  '/v1/photos'
, middleware.fields(fields)
, routes.list
);

// Photos.list
server.get(
  '/v1/businesses/:businessId/photos'
, middleware.fields(fields)
, routes.list
);

// Photos.list
server.get(
  '/v1/products/:productId/photos'
, middleware.fields(fields)
, routes.list
);

// Photos.create
server.post(
  '/v1/photos'
, middleware.validate(validators.create)
, routes.create
);

// Photos.get
server.get(
  '/v1/photos/:photoId'
, middleware.fields(fields)
, routes.get
);

// Photos.update
server.patch(
  '/v1/photos/:photoId'
, middleware.validate(validators.update)
, routes.update
);

// Photos.update
server.put(
  '/v1/photos/:photoId'
, middleware.validate(validators.update)
, routes.update
);

// Photos.update
server.post(
  '/v1/photos/:photoId'
, middleware.validate(validators.update)
, routes.update
);

// Photos.delete
server.del(
  '/v1/photos/:photoId'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

module.exports = server;