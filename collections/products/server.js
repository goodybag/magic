/**
 * Products server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var permissions = require('./permissions');
var desc = require('./description')

// Products.list
server.get(
  '/v1/products'
, middleware.profile('GET /v1/products', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list products handler')
, routes.list
);

// Products.list
server.get(
  '/v1/locations/:locationId/products'
, middleware.profile('GET /v1/locations/:locationId/products', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list products handler')
, routes.list
);

// Products.list
server.get(
  '/v1/businesses/:businessId/products'
, middleware.profile('GET /v1/businesses/:businessId/products', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate path')
, middleware.validate.path({
    businessId : { isInt:[] }
  })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list products handler')
, routes.list
);

// Products.list
server.get(
  '/v1/products/food'
, middleware.profile('GET /v1/products/food', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, function(req, res, next) { req.query.businessType = 'food'; next(); }
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list products handler')
, routes.list
);

// Products.list
server.get(
  '/v1/products/fashion'
, middleware.profile('GET /v1/products/fashion', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, function(req, res, next) { req.query.businessType = 'apparel'; next(); }
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list products handler')
, routes.list
);

// Products.list
server.get(
  '/v1/products/other'
, middleware.profile('GET /v1/products/other', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, function(req, res, next) { req.query.businessType = 'other'; next(); }
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list products handler')
, routes.list
);

// Products.create
server.post(
  '/v1/products'
, middleware.profile('POST /v1/products')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create product handler')
, routes.create
);

// Products.get
server.get(
  '/v1/products/:productId'
, middleware.profile('GET /v1/products/:productId')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get product handler')
, routes.get
);

// Products.update
server.put(
  '/v1/products/:productId'
, middleware.profile('PUT /v1/products/:productId')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product handler')
, routes.update
);

// Products.update
server.post(
  '/v1/products/:productId'
, middleware.profile('POST /v1/products/:productId')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product handler')
, routes.update
);

// Products.delete
server.del(
  '/v1/products/:productId'
, middleware.profile('DELETE /v1/products/:productId')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('delete product handler')
, routes.del
);

// Products.listCategories
server.get(
  '/v1/products/:productId/categories'
, middleware.profile('GET /v1/products/:productId/categories')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list product categories handler')
, routes.listCategories
);

// Products.addCategory
server.post(
  '/v1/products/:productId/categories'
, middleware.profile('POST /v1/products/:productId/categories')
, middleware.profile('validate body')
, middleware.validate2.body(desc.categoriesCollection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('add product category handler')
, routes.addCategory
);

// Products.delCategory
server.del(
  '/v1/products/:productId/categories/:categoryId'
, middleware.profile('DELETE /v1/products/:productId/categories/:categoryId')
, middleware.profile('delete product category handler')
, routes.delCategory
);

// Products.updateFeelings
server.post(
  '/v1/products/:productId/feelings'
, middleware.profile('POST /v1/products/:productId/feelings')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'manager', 'cashier', 'consumer')
, middleware.profile('validate body')
, middleware.validate2.body(desc.feelingsCollection.methods.post.body)
, middleware.profile('update product feelings handler')
, routes.updateFeelings
);

module.exports = server;