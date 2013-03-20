/**
 * Photos server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');
var desc = require('./description')

// Photos.list
server.get(
  '/v1/photos'
, middleware.profile('GET /v1/photos', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list photos handler')
, routes.list
);

// Photos.list
server.get(
  '/v1/businesses/:businessId/photos'
, middleware.profile('GET /v1/businesses/:businessId/photos', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list photos handler')
, routes.list
);

// Photos.list
server.get(
  '/v1/products/:productId/photos'
, middleware.profile('GET /v1/products/:productId/photos', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({ limit : 20 })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list photos handler')
, routes.list
);

// Photos.create
server.post(
  '/v1/photos'
, middleware.profile('POST /v1/photos')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create photo handler')
, routes.create
);

// Photos.create
server.post(
  '/v1/products/:productId/photos'
, middleware.profile('POST /v1/photos')
, function(req, res, next) { req.body.productId = req.param('productId'); next(); }
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create photo handler')
, routes.create
);

// Photos.get
server.get(
  '/v1/photos/:photoId'
, middleware.profile('GET /v1/photos/:photoId')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get photo handler')
, routes.get
);

// Photos.update
server.put(
  '/v1/photos/:photoId'
, middleware.profile('PUT /v1/photos/:photoId')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('apply groups photos owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('apply groups photos businessOwner')
, middleware.applyGroups(applyGroups.businessOwner)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update photo handler')
, routes.update
);

// Photos.update
server.post(
  '/v1/photos/:photoId'
, middleware.profile('POST /v1/photos/:photoId')
, middleware.profile('validate body')
, middleware.validate.body(desc.item.methods.put.body)
, middleware.profile('apply groups photos owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('apply groups photos businessOwner')
, middleware.applyGroups(applyGroups.businessOwner)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update photo handler')
, routes.update
);

// Photos.delete
server.del(
  '/v1/photos/:photoId'
, middleware.profile('DELETE /v1/photos/:photoId')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('delete photo handler')
, routes.del
);

module.exports = server;