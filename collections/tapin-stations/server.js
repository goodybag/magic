/**
 * Tapin Stations server
 */

var server     = require('express')();
var middleware = require('../../middleware');
var routes     = require('./routes');
var schema     = require('../../db').schemas.tapinStations;
var fields     = require('./fields');
var perms      = require('./permissions');

// tapinStations.list
server.get(
  '/v1/tapin-stations'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, routes.list
);

// tapinStations.get
server.get(
  '/v1/tapin-stations/:id'
, middleware.applyGroups(perms.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.fields(fields)
, routes.get
);

// tapinStations.create
server.post(
  '/v1/tapin-stations'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, middleware.validate.body(schema)
, routes.create
);

// tapinStations.update
server.patch(
  '/v1/tapin-stations/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, middleware.validate.body(schema)
, routes.update
);

// tapinStations.update
server.post(
  '/v1/tapin-stations/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields)
, middleware.validate.body(schema)
, routes.update
);

// tapinStations.delete
server.del(
  '/v1/tapin-stations/:id'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

module.exports = server;