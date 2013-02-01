/**
 * Businesses server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var schema      = require('../../db').schemas.businesses;
var permissions = require('./permissions');
var routes      = require('./routes');


// Businesses.list
server.get(
  '/v1/businesses'
, middleware.profile('/v1/businesses', ['include','limit'])
, middleware.profile('validate query')
, middleware.validate.query({
    sort       : { is:/(\+|-)?(name)/ },
    include    : { is:/locations/ },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list businesses handler')
, routes.list
);

// Businesses.get
server.get(
  '/v1/businesses/:id'
, middleware.profile('/v1/business/:id')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get business handler')
, routes.get
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
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.create
);

// Businesses.update
server.patch(
  '/v1/businesses/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

module.exports = server;