/**
 * Locations server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.locations;
var routes = require('./routes');
var fields = require('./fields');

// Locations.list
server.get(
  '/v1/locations'
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    businessId : { isInt:[] },
    tag        : { isAlpha:[] },
    sort       : { is:/(\+|-)?(name|distance|random)/ },
    include    : { is:/tags|categories/ },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.fields(fields.accessOne)
, routes.list
);

// Locations.list
server.get(
  '/v1/businesses/:businessId/locations'
, middleware.validate.path({
    businessId : { isInt:[] }
  })
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    tag        : { isAlpha:[] },
    sort       : { is:/(\+|-)?(name|distance|random)/ },
    include    : { is:/tags|categories/ },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.fields(fields.access)
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/food'
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    businessId : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { is:/(\+|-)?(name|distance|random)/ },
    include    : { is:/tags|categories/ },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.defaults.query({
    tag : ['food']
  })
, middleware.fields(fields.accessOne)
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/fashion'
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    businessId : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { is:/(\+|-)?(name|distance|random)/ },
    include    : { is:/tags|categories/ },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.defaults.query({
    tag : ['apparel']
  })
, middleware.fields(fields.accessOne)
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/other'
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    businessId : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { is:/(\+|-)?(name|distance|random)/ },
    include    : { is:/tags|categories/ },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.defaults.query({
    tag : ['!food,!apparel']
  })
, middleware.fields(fields.accessOne)
, routes.list
);

// Locations.create
server.post(
  '/v1/locations'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields.create)
, middleware.validate.body(schema)
, routes.create
);

// Locations.get
server.get(
  '/v1/locations/:locationId'
, middleware.fields(fields.access)
, routes.get
);

// Locations.update
server.patch(
  '/v1/locations/:locationId'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields.mutate)
, middleware.validate.body(schema)
, routes.update
);

// Locations.update
server.post(
  '/v1/locations/:locationId'
, middleware.auth.allow('admin', 'sales')
, middleware.fields(fields.mutate)
, middleware.validate.body(schema)
, routes.update
);

// Locations.delete
server.del(
  '/v1/locations/:locationId'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

module.exports = server;