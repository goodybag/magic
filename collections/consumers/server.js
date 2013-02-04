/**
 * consumers server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');
var schema      = require('../../db').schemas.consumers;
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');

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