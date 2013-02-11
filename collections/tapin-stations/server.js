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
, middleware.profile('GET /v1/tapin-stations', ['limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list tapinStations handler')
, routes.list
);

// tapinStations.get
server.get(
  '/v1/tapin-stations/:id'
, middleware.profile('GET /v1/tapin-stations/:id')
, middleware.profile('apply groups tapinStations owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'owner')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get tapinStation handler')
, routes.get
);

// tapinStations.create
server.post(
  '/v1/tapin-stations'
, middleware.profile('POST /v1/tapin-stations')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('create tapinStation handler')
, routes.create
);

// tapinStations.update
server.put(
  '/v1/tapin-stations/:id'
, middleware.profile('PUT /v1/tapin-stations/:id')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update tapinStation handler')
, routes.update
);

// tapinStations.update
server.post(
  '/v1/tapin-stations/:id'
, middleware.profile('POST /v1/tapin-stations/:id')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update tapinStation handler')
, routes.update
);

// tapinStations.delete
server.del(
  '/v1/tapin-stations/:id'
, middleware.profile('DELETE /v1/tapin-stations/:id')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('delete tapinStation handler')
, routes.del
);

// tapinStations.createHeartbeat
server.post(
  '/v1/tapin-stations/:id/heartbeat'
, middleware.profile('POST /v1/tapin-stations/:id/heartbeat')
, middleware.profile('apply groups tapinStations owner')
, middleware.applyGroups(applyGroups.owner)
, middleware.profile('auth allow')
, middleware.auth.allow('owner')
, middleware.profile('create tapinStation heartbeat handler')
, routes.createHeartbeat
);

module.exports = server;