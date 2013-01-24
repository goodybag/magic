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

// ProductTags.get
server.get(
  '/v1/product-tags/:tagId'
, middleware.fields(fields)
, routes.get
);

// ProductTags.get
server.get(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.fields(fields)
, routes.get
);

// ProductTags.create
server.post(
  '/v1/businesses/:businessId/product-tags'
, middleware.validate.body(schema)
, middleware.fields(fields)
, routes.create
);

// ProductTags.update
server.patch(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.validate.body(schema)
, middleware.fields(fields)
, routes.update
);

// ProductTags.update
server.post(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.validate.body(schema)
, middleware.fields(fields)
, routes.update
);

// ProductTags.delete
server.del(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, routes.del
);

module.exports = server;