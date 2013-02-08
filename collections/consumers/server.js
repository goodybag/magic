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

// consumers.list
server.get(
  '/v1/consumers'
, middleware.permissions(permissions.consumer)
, routes.list
);

// consumers.get
server.get(
  '/v1/consumers/:consumerId'
, middleware.applyGroups(applyGroups.owner)
, middleware.permissions(permissions.consumer)
, routes.get
);

// consumers.create
server.post(
  '/v1/consumers'
  // Make the requester owner so they can read their own fields after creation
, function(req, res, next){ req.permittedGroups = ['owner']; next(); }
, function(req, res, next){
    if (req.body.singlyAccessToken && req.body.singlyId) return next();
    if (!req.body.email) req.body.email = null;
    if (!req.body.password) req.body.password = null;
    next();
  }
, middleware.permissions(permissions.consumer)
, middleware.validate.body(schema)
, routes.create
);

// consumers.update
server.put(
  '/v1/consumers/:consumerId'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'owner')
, middleware.permissions(permissions.consumer)
, middleware.validate.body(schema)
, routes.update
);

// consumers.update
server.post(
  '/v1/consumers/:consumerId'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'owner')
, middleware.permissions(permissions.consumer)
, middleware.validate.body(schema)
, routes.update
);

// consumers.delete
server.del(
  '/v1/consumers/:consumerId'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'owner')
, routes.del
);

// consumers.listCollections
server.get(
  '/v1/consumers/:consumerId/collections'
, middleware.applyGroups(applyGroups.owner)
, middleware.permissions(permissions.collection)
, routes.listCollections
);

// consumers.createCollections
server.post(
  '/v1/consumers/:consumerId/collections'
, middleware.applyGroups(applyGroups.owner)
, middleware.permissions(permissions.collection)
, middleware.validate.body(schemas.collection)
, routes.createCollection
);

// consumers.listCollectionProducts
server.get(
  '/v1/consumers/:consumerId/collections/:collectionId'
, middleware.applyGroups(applyGroups.owner)
, middleware.permissions(permissions.collectionProducts)
, require('../products/routes').list
);

// consumers.addCollectionProduct
server.post(
  '/v1/consumers/:consumerId/collections/:collectionId'
, middleware.applyGroups(applyGroups.owner)
, middleware.permissions(permissions.collectionProducts)
, middleware.validate.body(schemas.productsCollections)
, routes.addCollectionProduct
);

module.exports = server;