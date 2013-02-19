/**
 * consumers server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var utils       = require('../../lib/utils');
var routes      = require('./routes');
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');
var desc        = require('./description.yaml');

// consumers.createCardupdate
server.post(
  '/v1/consumers/cardupdate'
, middleware.profile('POST /v1/consumers/cardupdate')
, middleware.profile('validate body')
, middleware.validate2.body(desc.cardUpdatesCollection.methods.post.body)
, middleware.profile('create card update handler')
, routes.createCardupdate
);

// consumers.cardupdate
server.post(
  '/v1/consumers/cardupdate/:token'
, middleware.profile('POST /v1/consumers/cardupdate/:token')
, middleware.profile('update card handler')
, routes.updateCard
);

// consumers.list
server.get(
  '/v1/consumers'
, middleware.profile('GET /v1/consumers', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions.consumer)
, middleware.profile('list consumers handler')
, routes.list
);

// consumers.get
server.get(
  '/v1/consumers/:userId'
, middleware.profile('GET /v1/consumers/:userId')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.consumer)
, middleware.profile('get consumer handler')
, routes.get
);

// consumers.create
server.post(
  '/v1/consumers'
, middleware.profile('POST /v1/consumers/:userId')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
  // Make the requester owner so they can read their own fields after creation
, function(req, res, next){ req.permittedGroups = ['owner']; next(); }
, middleware.profile('permissions')
, middleware.permissions(permissions.consumer)
, middleware.profile('create consumer handler')
, routes.create
);

// consumers.update
server.put(
  '/v1/consumers/:userId'
, middleware.profile('PUT /v1/consumers/:userId')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('permissions')
, middleware.permissions(permissions.consumer)
, middleware.profile('update consumer handler')
, routes.update
);

// consumers.update
server.post(
  '/v1/consumers/:userId'
, middleware.profile('POST /v1/consumers/:userId')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('permissions')
, middleware.permissions(permissions.consumer)
, middleware.profile('update consumer handler')
, routes.update
);

// consumers.delete
server.del(
  '/v1/consumers/:userId'
, middleware.profile('DELETE /v1/consumers/:userId')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('delete consumer handler')
, routes.del
);

// consumers.updatePassword
server.post(
  '/v1/consumers/:userId/password'
, middleware.profile('POST /v1/consumers/:userId')
, middleware.profile('validate body')
, middleware.validate2.body(desc.consumerPasswordItem.methods.post.body)
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('permissions')
, middleware.permissions(permissions.consumerPassword)
, middleware.profile('update consumer password handler')
, routes.updatePassword
);

// consumers.listCollections
server.get(
  '/v1/consumers/:userId/collections'
, middleware.profile('GET /v1/consumers/:userId/collections')
, middleware.profile('validate query')
, middleware.validate2.query(desc.collectionsCollection.methods.get.query)
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.collection)
, middleware.profile('list consumer collections handler')
, routes.listCollections
);

// consumers.createCollections
server.post(
  '/v1/consumers/:userId/collections'
, middleware.profile('POST /v1/consumers/:userId/collections')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collectionsCollection.methods.post.body)
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.collection)
, middleware.profile('create consumer collection handler')
, routes.createCollection
);

// consumers.getCollection
server.get(
  '/v1/consumers/:userId/collections/:collectionId'
, middleware.profile('GET /v1/consumers/:userId/collections/:collectionId')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.collection)
, middleware.profile('get consumer collection handler')
, routes.getCollection
);

// consumers.updateCollection
server.put(
  '/v1/consumers/:userId/collections/:collectionId'
, middleware.profile('PUT /v1/consumers/:userId/collections/:collectionId')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collectionsItem.methods.put.body)
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.collection)
, middleware.profile('update consumer collection handler')
, routes.updateCollection
);

// consumers.deleteCollections
server.del(
  '/v1/consumers/:userId/collections/:collectionId'
, middleware.profile('DELETE /v1/consumers/:userId/collections/:collectionId')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('delete consumer collection handler')
, routes.deleteCollection
);

// consumers.deleteCollections
server.del(
  '/v1/collections/:collectionId'
, middleware.profile('DELETE /v1/consumers/:userId/collections/:collectionId')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.collectionOwner)
, middleware.profile('permissions')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('delete consumer collection handler')
, routes.deleteCollection
);

// consumers.listCollectionProducts
server.get(
  '/v1/consumers/:userId/collections/:collectionId/products'
, middleware.profile('GET /v1/consumers/:userId/collections/:collectionId/products')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.collectionProducts)
, middleware.profile('validate query')
, middleware.validate2.query(desc.collectionProductsCollection.methods.get.query)
, middleware.profile('list consumer collection products handler')
, require('../products/routes').list
);

// consumers.addCollectionProduct
server.post(
  '/v1/consumers/:userId/collections/:collectionId/products'
, middleware.profile('POST /v1/consumers/:userId/collections/:collectionID')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collectionProductsCollection.methods.post.body)
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.collectionProducts)
, middleware.profile('add product to consumer collection handler')
, routes.addCollectionProduct
);

module.exports = server;