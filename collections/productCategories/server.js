/**
 * Product Categories server
 */

var
  server      = require('express')()
, middleware  = require('../../middleware')
, routes      = require('./routes')
, schema      = require('../../db').schemas.productCategories
, permissions = require('./permissions')
, auth        = middleware.auth
, validate    = middleware.validate.body
;

// ProductCategories.list
server.get(
  '/v1/productCategories'
, middleware.permissions(permissions)
, routes.list
);

// ProductCategories.create
server.post(
  '/v1/productCategories'
, auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, validate(schema)
, routes.create
);

// ProductCategories.get
server.get(
  '/v1/productCategories/:id'
, middleware.permissions(permissions)
, routes.get
);

// ProductCategories.update
server.put(
  '/v1/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, validate(schema)
, routes.update
);

// ProductCategories.update
server.put(
  '/v1/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, validate(schema)
, routes.update
);

// ProductCategories.update
server.post(
  '/v1/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, validate(schema)
, routes.update
);

// ProductCategories.delete
server.del(
  '/v1/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, routes.del
);

// ProductCategories.list
server.get(
  '/v1/businesses/:businessId/productCategories'
, middleware.permissions(permissions)
, routes.list
);

// ProductCategories.create
server.post(
  '/v1/businesses/:businessId/productCategories'
, auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, validate(schema)
, routes.create
);

// ProductCategories.get
server.get(
  '/v1/businesses/:businessId/productCategories/:id'
, middleware.permissions(permissions)
, routes.get
);

// ProductCategories.update
server.put(
  '/v1/businesses/:businessId/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, validate(schema)
, routes.update
);

// ProductCategories.update
server.put(
  '/v1/businesses/:businessId/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, validate(schema)
, routes.update
);

// ProductCategories.update
server.post(
  '/v1/businesses/:businessId/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, validate(schema)
, routes.update
);

// ProductCategories.delete
server.del(
  '/v1/businesses/:businessId/productCategories/:id'
, auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, routes.del
);

module.exports = server;