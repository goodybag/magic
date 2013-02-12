/**
 * Photos server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.photos;
var routes = require('./routes');
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');

// Photos.list
server.get(
  '/v1/photos'
, middleware.profile('GET /v1/photos', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
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
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
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
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
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
, middleware.validate.body(schema)
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
, middleware.validate.body(schema)
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
, middleware.validate.body(schema)
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