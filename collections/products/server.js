/**
 * Products server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var schema = require('../../db').schemas.products;
var fields = require('./fields');

// Products.list
server.get(
  '/v1/products'
, middleware.fields(fields.read.products)
, routes.list
);

// Products.list
server.get(
  '/v1/businesses/:businessId/products'
, middleware.fields(fields.read.products)
, routes.list
);

// Products.create
server.post(
  '/v1/products'
, middleware.fields(fields.mutate.product)
, middleware.validate(schema)
, routes.create
);

// Products.get
server.get(
  '/v1/products/:productId'
, middleware.fields(fields.read.product)
, routes.get
);

// Products.update
server.patch(
  '/v1/products/:productId'
, middleware.fields(fields.mutate.product)
, middleware.validate(schema)
, routes.update
);

// Products.update
server.post(
  '/v1/products/:productId'
, middleware.fields(fields.mutate.product)
, middleware.validate(schema)
, routes.update
);

// Products.delete
server.del(
  '/v1/products/:productId'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

// Products.listCategories
server.get(
  '/v1/products/:productId/categories'
, middleware.fields(fields.read.productCategory)
, routes.listCategories
);

// Products.addCategory
server.post(
  '/v1/products/:productId/categories'
, middleware.fields(fields.mutate.productCategory)
, routes.addCategory
);

// Products.delCategory
server.del(
  '/v1/products/:productId/categories/:categoryId'
, routes.delCategory
);

module.exports = server;