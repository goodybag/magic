/**
 * Tapin Stations server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var routes      = require('./routes');
var schema      = require('../../db').schemas.tapinStations;
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');

// tapinStations.list
server.get(
  '/v1/tapin-stations'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, routes.list
);

// tapinStations.get
server.get(
  '/v1/tapin-stations/:id'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.permissions(permissions)
, routes.get
);

// tapinStations.create
server.post(
  '/v1/tapin-stations'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.create
);

// tapinStations.update
server.put(
  '/v1/tapin-stations/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// tapinStations.update
server.post(
  '/v1/tapin-stations/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// tapinStations.delete
server.del(
  '/v1/tapin-stations/:id'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

// tapinStations.createHeartbeat
server.post(
  '/v1/tapin-stations/:id/heartbeat'
, middleware.applyGroups(applyGroups.owner)
, middleware.auth.allow('owner')
, routes.createHeartbeat
);

module.exports = server;