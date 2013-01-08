/**
 * ProductTags server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var schema = require('../../db').schemas.productTags;
var fields = require('./fields');

// ProductTags.list
server.get(
  '/v1/product-tags'
, middleware.fields(fields)
, routes.list
);

// ProductTags.list
server.get(
  '/v1/businesses/:businessId/product-tags'
, middleware.fields(fields)
, routes.list
);

// ProductTags.list
server.get(
  '/v1/products/:productId/tags'
, middleware.fields(fields)
, routes.list
);

// ProductTags.update
server.patch(
  '/v1/product-tags/:tag'
, middleware.validate(schema)
, middleware.fields(fields)
, routes.update
);

// ProductTags.update
server.patch(
  '/v1/businesses/:businessId/product-tags/:tag'
, middleware.validate(schema)
, middleware.fields(fields)
, routes.update
);

// ProductTags.update
server.patch(
  '/v1/products/:productId/tags/:tag'
, middleware.validate(schema)
, middleware.fields(fields)
, routes.update
);

// ProductTags.update
server.post(
  '/v1/product-tags/:tag'
, middleware.validate(schema)
, middleware.fields(fields)
, routes.update
);

// ProductTags.update
server.post(
  '/v1/businesses/:businessId/product-tags/:tag'
, middleware.validate(schema)
, middleware.fields(fields)
, routes.update
);

// ProductTags.update
server.post(
  '/v1/products/:productId/tags/:tag'
, middleware.validate(schema)
, middleware.fields(fields)
, routes.update
);

// ProductTags.delete
server.del(
  '/v1/product-tags/:tag'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, routes.del
);

// ProductTags.delete
server.del(
  '/v1/businesses/:businessId/product-tags/:tag'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, routes.del
);

// ProductTags.delete
server.del(
  '/v1/products/:productId/tags/:tag'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, routes.del
);

module.exports = server;