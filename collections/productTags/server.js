/**
 * ProductTags server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var permissions = require('./permissions');
var desc = require('./description');

// ProductTags.list
server.get(
  '/v1/product-tags'
, middleware.profile('GET /v1/product-tags', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list product tags handler')
, routes.list
);

// ProductTags.list
server.get(
  '/v1/businesses/:businessId/product-tags'
, middleware.profile('GET /v1/businesses/:businessId/product-tags', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list product tags handler')
, routes.list
);

// ProductTags.get
server.get(
  '/v1/product-tags/:tagId'
, middleware.profile('GET /v1/product-tags/:tagId')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get product tag handler')
, routes.get
);

// ProductTags.get
server.get(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.profile('GET /v1/businesses/:businessId/product-tags/:tagId')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get product tag handler')
, routes.get
);

// ProductTags.create
server.post(
  '/v1/businesses/:businessId/product-tags'
, middleware.profile('POST /v1/businesses/:businessId/product-tags')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create product tag handler')
, routes.create
);

// ProductTags.update
server.put(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.profile('PUT /v1/businesses/:businessId/product-tags/:tagId')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product tag handler')
, routes.update
);

// ProductTags.update
server.post(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.profile('POST /v1/businesses/:businessId/product-tags/:tagId')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product tag handler')
, routes.update
);

// ProductTags.delete
server.del(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.profile('DELETE /v1/businesses/:businessId/product-tags/:tagId')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('delete product tag handler')
, routes.del
);

module.exports = server;