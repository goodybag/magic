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

// ProductTags.create
server.post(
  '/v1/product-tags'
, middleware.validate(schema)
, routes.create
);

// ProductTags.get
server.get(
  '/v1/product-tags/:productTagId'
, middleware.fields(fields)
, routes.get
);

// ProductTags.update
server.patch(
  '/v1/product-tags/:productTagId'
, middleware.validate(schema)
, routes.update
);

// ProductTags.update
server.post(
  '/v1/product-tags/:productTagId'
, middleware.validate(schema)
, routes.update
);

// ProductTags.delete
server.del(
  '/v1/product-tags/:productTagId'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

module.exports = server;