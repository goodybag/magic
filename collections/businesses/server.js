/**
 * Businesses server
 */

var server     = require('express')();
var middleware = require('../../middleware');
var schema     = require('../../db').schemas.businesses;
var fields     = require('./fields');
var routes     = require('./routes');

// Businesses.list
server.get(
  '/v1/businesses'
, middleware.validate.query({
    sort       : { is:/(\+|-)?(name)/ },
    include    : { is:/locations/ },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.fields(fields.businesses)
, routes.list
);

// Businesses.get
server.get(
  '/v1/businesses/:id'
, middleware.fields(fields.business)
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
, middleware.fields(fields.business)
, middleware.validate.body(schema)
, routes.create
);

// Businesses.update
server.patch(
  '/v1/businesses/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields.business)
, middleware.validate.body(schema)
, routes.update
);

module.exports = server;