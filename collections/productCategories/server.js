/**
 * Product Categories server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var schema = require('../../db').schemas.productCategories;
var fields = require('./fields');
var auth = middleware.auth;
var validate = middleware.validate;

// ProductCategories.list
server.get(
  '/v1/productCategories'
, middleware.fields(fields)
, routes.list
);

// ProductCategories.list
server.get(
  '/v1/businesses/:businessId/productCategories'
, middleware.fields(fields)
, routes.list
);

// ProductCategories.create
server.post(
  '/v1/productCategories'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, validate(schema)
, routes.create
);

// ProductCategories.get
server.get(
  '/v1/productCategories/:id'
, middleware.fields(fields)
, routes.get
);

// ProductCategories.update
server.patch(
  '/v1/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, validate(schema)
, routes.update
);

// ProductCategories.update
server.post(
  '/v1/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, validate(schema)
, routes.update
);

// ProductCategories.delete
server.del(
  '/v1/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, routes.del
);

module.exports = server;