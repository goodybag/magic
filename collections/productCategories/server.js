/**
 * Product Categories server
 */

var
  server      = require('express')()
, middleware  = require('../../middleware')
, routes      = require('./routes')
, permissions = require('./permissions')
, auth        = middleware.auth
, validate    = middleware.validate.body
, desc        = require('./description')
;

// ProductCategories.list
server.get(
  '/v1/product-categories'
, middleware.profile('GET /v1/product-categories')
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list product categories handler')
, routes.list
);

// ProductCategories.create
server.post(
  '/v1/product-categories'
, middleware.profile('POST /v1/product-categories')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create product category handler')
, routes.create
);

// ProductCategories.get
server.get(
  '/v1/product-categories/:id'
, middleware.profile('GET /v1/product-categories/:id')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get product category handler')
, routes.get
);

// ProductCategories.update
server.put(
  '/v1/product-categories/:id'
, middleware.profile('PUT /v1/product-categories/:id')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product category handler')
, routes.update
);

// ProductCategories.update
server.post(
  '/v1/product-categories/:id'
, middleware.profile('POST /v1/product-categories/:id')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product category handler')
, routes.update
);

// ProductCategories.delete
server.del(
  '/v1/product-categories/:id'
, middleware.profile('DELETE /v1/product-categories/:id')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('delete product category handler')
, routes.del
);

// ProductCategories.list
server.get(
  '/v1/businesses/:businessId/product-categories'
, middleware.profile('GET /v1/businesses/:businessId/product-categories')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list product categories handler')
, routes.list
);

// ProductCategories.create
server.post(
  '/v1/businesses/:businessId/product-categories'
, middleware.profile('POST /v1/businesses/:businessId/product-categories')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create product category handler')
, routes.create
);

// ProductCategories.get
server.get(
  '/v1/businesses/:businessId/product-categories/:id'
, middleware.profile('GET /v1/businesses/:businessId/product-categories/:id')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get product category handler')
, routes.get
);

// ProductCategories.update
server.put(
  '/v1/businesses/:businessId/product-categories/:id'
, middleware.profile('PUT /v1/businesses/:businessId/product-categories/:id')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product category handler')
, routes.update
);

// ProductCategories.update
server.post(
  '/v1/businesses/:businessId/product-categories/:id'
, middleware.profile('POST /v1/businesses/:businessId/product-categories/:id')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product category handler')
, routes.update
);

// ProductCategories.delete
server.del(
  '/v1/businesses/:businessId/product-categories/:id'
, middleware.profile('DELETE /v1/businesses/:businessId/product-categories/:id')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('delete product category handler')
, routes.del
);

module.exports = server;