/**
 * Locations server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var permissions = require('./permissions');
var menuPermissions = require('./menu-permissions');
var applyGroups = require('./apply-groups');
var desc = require('./description')

// Locations.list
server.get(
  '/v1/locations'
, middleware.profile('GET /v1/locations', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list locations handler')
, routes.list
);

// Locations.list
server.get(
  '/v1/businesses/:businessId/locations'
, middleware.profile('GET /v1/businesses/:businessId/locations', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate path')
, middleware.validate2.path({ businessId: { type:'int' }})
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list locations handler')
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/food'
, middleware.profile('GET /v1/locations/food', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, function(req, res, next) { req.query.tag = 'food'; next(); }
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list locations handler')
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/fashion'
, middleware.profile('GET /v1/locations/fashion', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, function(req, res, next) { req.query.tag = 'apparel'; next(); }
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list locations handler')
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/other'
, middleware.profile('GET /v1/locations/other', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, function(req, res, next) { req.query.tag = '!food,!apparel'; next(); }
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list locations handler')
, routes.list
);

// Locations.create
server.post(
  '/v1/locations'
, middleware.profile('POST /v1/locations')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create location handler')
, routes.create
);

// Locations.get
server.get(
  '/v1/locations/:locationId'
, middleware.profile('GET /v1/locations/:locationId')
, middleware.profile('permissions')
, middleware.applyGroups(applyGroups.manager)
, middleware.permissions(permissions)
, middleware.profile('get location handler')
, routes.get
);

// Locations.update
server.put(
  '/v1/locations/:locationId'
, middleware.profile('PUT /v1/locations/:locationId')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update location handler')
, routes.update
);

// Locations.update
server.post(
  '/v1/locations/:locationId'
, middleware.profile('POST /v1/locations/:locationId')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update location handler')
, routes.update
);

// Locations.delete
server.del(
  '/v1/locations/:locationId'
, middleware.profile('DELETE /v1/locations/:locationId')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('delete location handler')
, routes.del
);

// Locations.getAnalytics
server.get(
  '/v1/locations/:locationId/analytics'
, middleware.profile('GET /v1/locations/:locationId/analytics')
, middleware.profile('apply groups locations manager')
, middleware.applyGroups(applyGroups.manager)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'manager')
, middleware.profile('get location analytics handler')
, routes.getAnalytics
);

// Locations.addProduct
server.post(
  '/v1/locations/:locationId/products'
, middleware.profile('GET /v1/locations/:locationId/products')
, middleware.profile('apply groups locations manager')
, middleware.applyGroups(applyGroups.manager)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'manager')
, middleware.profile('validate body')
, middleware.validate2.body(desc.productsCollection.methods.post.body)
, middleware.profile('add product to location handler')
, routes.addProduct
);

// Locations.updateProduct
server.put(
  '/v1/locations/:locationId/products/:productId'
, middleware.profile('PUT /v1/locations/:locationId/products/:productId')
, middleware.profile('apply groups locations manager')
, middleware.applyGroups(applyGroups.manager)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'manager')
, middleware.profile('validate body')
, middleware.validate2.body(desc.productsItem.methods.put.body)
, middleware.profile('update product at location handler')
, routes.updateProduct
);

// Locations.removeProduct
server.del(
  '/v1/locations/:locationId/products/:productId'
, middleware.profile('DELETE /v1/locations/:locationId/products/:productId')
, middleware.profile('apply groups locations manager')
, middleware.applyGroups(applyGroups.manager)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'manager')
, middleware.profile('remove product from location handler')
, routes.removeProduct
);

// Locations.submitKeyTagRequest
server.post(
  '/v1/locations/:locationId/key-tag-requests'
, middleware.profile('POST /v1/locations/:locationId/key-tag-requests')
, middleware.profile('apply groups locations manager')
, middleware.applyGroups(applyGroups.manager)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'manager')
, middleware.profile('request key tag handler')
, routes.submitKeyTagRequest
);

// Locations.getMenu
server.get(
  '/v1/locations/:locationId/menu-sections'
, middleware.profile('GET /v1/locations/:locationId/menu-sections')
, middleware.profile('query defaults')
  // Just get the entire result set
, middleware.defaults.query({ limit : 1000 })
, middleware.profile('permissions')
, middleware.permissions(menuPermissions)
, middleware.profile('get location menu-sections handler')
, routes.menuSections.list
);

module.exports = server;