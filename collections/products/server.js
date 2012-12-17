/**
 * Products server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var validators = require('./schema/validators');
var fields = require('./auth/fields');

// Products.list
server.get(
  '/v1/products'
, middleware.fields(fields)
, routes.list
);

// Products.list
server.get(
  '/v1/businesses/:businessId/products'
, middleware.fields(fields)
, routes.list
);

// Products.create
server.post(
  '/v1/products'
, middleware.validate(validators.create)
, routes.create
);

// Products.get
server.get(
  '/v1/products/:productId'
, middleware.fields(fields)
, routes.get
);

// Products.update
server.patch(
  '/v1/products/:productId'
, middleware.validate(validators.update)
, routes.update
);

// Products.update
server.put(
  '/v1/products/:productId'
, middleware.validate(validators.update)
, routes.update
);

// Products.update
server.post(
  '/v1/products/:productId'
, middleware.validate(validators.update)
, routes.update
);

// Products.delete
server.del(
  '/v1/products/:productId'
, routes.del
);

module.exports = server;