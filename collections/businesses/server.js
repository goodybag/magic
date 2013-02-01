/**
 * Businesses server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var schema      = require('../../db').schemas.businesses;
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');
var routes      = require('./routes');

// Businesses.list
server.get(
  '/v1/businesses'
, middleware.validate.query({
    sort       : { is:/(\+|-)?(name)/ },
    include    : { is:/locations/ },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.permissions(permissions.business)
, routes.list
);

// Businesses.get
server.get(
  '/v1/businesses/:id'
, middleware.permissions(permissions.business)
, routes.get
);


// Businesses.loyalty.get
server.get(
  '/v1/businesses/:id/loyalty'
, routes.getLoyalty
);

// Businesses.loyalty.patch
server.patch(
  '/v1/businesses/:id/loyalty'
, middleware.auth.allow('admin', 'sales', 'managerOwner')
, middleware.permissions(permissions.loyalty)
, routes.updateLoyalty
);

// Businesses.del
server.del(
  '/v1/businesses/:id'
, middleware.auth.allow('admin')
, routes.del
);

// Businesses.create
server.post(
  '/v1/businesses'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions.business)
, middleware.validate.body(schema)
, routes.create
);

// Businesses.update
server.patch(
  '/v1/businesses/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions.business)
, middleware.validate.body(schema)
, routes.update
);

module.exports = server;