/**
 * Product Categories server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var validators = require('./validators');
var fields = require('./auth/fields');
var auth = middleware.auth;
var validate = middleware.validate;

// ProductCategories.list
server.get(
  '/v1/productCategories'
, middleware.fields(fields)
, routes.list
);

// ProductCategories.create
server.post(
  '/v1/productCategories'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, validate(validators.create)
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
, validate(validators.update)
, routes.update
);

// ProductCategories.update
server.put(
  '/v1/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, validate(validators.update)
, routes.update
);

// ProductCategories.update
server.post(
  '/v1/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, validate(validators.update)
, routes.update
);

// ProductCategories.delete
server.del(
  '/v1/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, routes.del
);

// ProductCategories.list
server.get(
  '/v1/businesses/:businessId/productCategories'
, middleware.fields(fields)
, routes.list
);

// ProductCategories.create
server.post(
  '/v1/businesses/:businessId/productCategories'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, validate(validators.create)
, routes.create
);

// ProductCategories.get
server.get(
  '/v1/businesses/:businessId/productCategories/:id'
, middleware.fields(fields)
, routes.get
);

// ProductCategories.update
server.patch(
  '/v1/businesses/:businessId/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, validate(validators.update)
, routes.update
);

// ProductCategories.update
server.put(
  '/v1/businesses/:businessId/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, validate(validators.update)
, routes.update
);

// ProductCategories.update
server.post(
  '/v1/businesses/:businessId/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, validate(validators.update)
, routes.update
);

// ProductCategories.delete
server.del(
  '/v1/businesses/:businessId/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.fields(fields)
, routes.del
);

module.exports = server;