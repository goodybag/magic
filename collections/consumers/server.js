/**
 * consumers server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var utils       = require('../../lib/utils');
var routes      = require('./routes');
var schemas     = require('../../db').schemas;
var schema      = utils.clone(schemas.consumers);
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');

// this is a hack for now to get validation on email and password
schema.email = utils.clone(schemas.users.email);
schema.password = utils.clone(schemas.users.password);

schema.email.validators = schema.email.validators || {};
schema.password.validators = schema.password.validators || {};

schema.email.validators['notNull'] = [];
schema.email.validators['isEmail'] = [];

schema.password.validators['notNull'] = [];

// consumers.createCardupdate
server.post(
  '/v1/consumers/cardupdate'
, middleware.profile('POST /v1/consumers/cardupdate')
, middleware.profile('validate body')
, middleware.validate.body({ email:schemas.users.email, cardId:schemas.consumerCardUpdates.newCardId })
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
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('permissions')
, middleware.permissions(permissions.consumer)
, middleware.profile('list consumers handler')
, routes.list
);

// consumers.get
server.get(
  '/v1/consumers/:consumerId'
, middleware.profile('GET /v1/consumers/:consumerId')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.consumer)
, middleware.profile('get consumer handler')
, routes.get
);

// consumers.create
server.post(
  '/v1/consumers'
, middleware.profile('POST /v1/consumers/:consumerId')
  // Make the requester owner so they can read their own fields after creation
, function(req, res, next){ req.permittedGroups = ['owner']; next(); }
, function(req, res, next){
    if (req.body.singlyAccessToken && req.body.singlyId) return next();
    if (!req.body.email) req.body.email = null;
    if (!req.body.password) req.body.password = null;
    next();
  }
, middleware.profile('permissions')
, middleware.permissions(permissions.consumer)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('create consumer handler')
, routes.create
);

// consumers.update
server.put(
  '/v1/consumers/:consumerId'
, middleware.profile('PUT /v1/consumers/:consumerId')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('permissions')
, middleware.permissions(permissions.consumer)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update consumer handler')
, routes.update
);

// consumers.update
server.post(
  '/v1/consumers/:consumerId'
, middleware.profile('POST /v1/consumers/:consumerId')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('permissions')
, middleware.permissions(permissions.consumer)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update consumer handler')
, routes.update
);

// consumers.delete
server.del(
  '/v1/consumers/:consumerId'
, middleware.profile('DELETE /v1/consumers/:consumerId')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('delete consumer handler')
, routes.del
);

// consumers.listCollections
server.get(
  '/v1/consumers/:consumerId/collections'
, middleware.profile('GET /v1/consumers/:consumerId/collections')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.collection)
, middleware.profile('list consumer collections handler')
, routes.listCollections
);

// consumers.createCollections
server.post(
  '/v1/consumers/:consumerId/collections'
, middleware.profile('POST /v1/consumers/:consumerId/collections')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.collection)
, middleware.profile('validate body')
, middleware.validate.body(schemas.collection)
, middleware.profile('create consumer collection handler')
, routes.createCollection
);

// consumers.deleteCollections
server.del(
  '/v1/consumers/:consumerId/collections/:collectionId'
, middleware.profile('DELETE /v1/consumers/:consumerId/collections/:collectionId')
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
, middleware.profile('DELETE /v1/consumers/:consumerId/collections/:collectionId')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.auth.allow('admin', 'owner')
, middleware.profile('delete consumer collection handler')
, routes.deleteCollection
);

// consumers.listCollectionProducts
server.get(
  '/v1/consumers/:consumerId/collections/:collectionId'
, middleware.profile('GET /v1/consumers/:consumerId/collections/:collectionID')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.collectionProducts)
, middleware.profile('list consumer collection products handler')
, require('../products/routes').list
);

// consumers.addCollectionProduct
server.post(
  '/v1/consumers/:consumerId/collections/:collectionId'
, middleware.profile('POST /v1/consumers/:consumerId/collections/:collectionID')
, middleware.profile('apply groups consumers owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('permissions')
, middleware.permissions(permissions.collectionProducts)
, middleware.profile('validate body')
, middleware.validate.body(schemas.productsCollections)
, middleware.profile('add product to consumer collection handler')
, routes.addCollectionProduct
);

module.exports = server;