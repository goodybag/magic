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
, middleware.permissions(permissions)
, routes.list
);

// consumers.get
server.get(
  '/v1/consumers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.permissions(permissions)
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
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.create
);

// consumers.update
server.put(
  '/v1/consumers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'owner')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// consumers.update
server.post(
  '/v1/consumers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'owner')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// consumers.delete
server.del(
  '/v1/consumers/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'owner')
, routes.del
);

module.exports = server;