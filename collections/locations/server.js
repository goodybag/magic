/**
 * Locations server
 */

var server = require('express')();
var middleware = require('../../middleware');
var schema = require('../../db').schemas.locations;
var routes = require('./routes');
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');

// Locations.list
server.get(
  '/v1/locations'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    businessId : { isInt:[] },
    tag        : { isAlpha:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random']] },
    include    : { isIn:[['tags','categories']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.permissions(permissions)
, routes.list
);

// Locations.list
server.get(
  '/v1/businesses/:businessId/locations'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.path({
    businessId : { isInt:[] }
  })
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    tag        : { isAlpha:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random']] },
    include    : { isIn:[['tags','categories']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.permissions(permissions)
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/food'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    businessId : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random']] },
    include    : { isIn:[['tags','categories']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.defaults.query({
    tag : ['food']
  })
, middleware.permissions(permissions)
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/fashion'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    businessId : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random']] },
    include    : { isIn:[['tags','categories']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.defaults.query({
    tag : ['apparel']
  })
, middleware.permissions(permissions)
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/other'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    businessId : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random']] },
    include    : { isIn:[['tags','categories']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.defaults.query({
    tag : ['!food,!apparel']
  })
, middleware.permissions(permissions)
, routes.list
);

// Locations.create
server.post(
  '/v1/locations'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.create
);

// Locations.get
server.get(
  '/v1/locations/:locationId'
, middleware.permissions(permissions)
, routes.get
);

// Locations.update
server.put(
  '/v1/locations/:locationId'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// Locations.update
server.post(
  '/v1/locations/:locationId'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// Locations.delete
server.del(
  '/v1/locations/:locationId'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

// Locations.getAnalytics
server.get(
  '/v1/locations/:locationId/analytics'
, middleware.applyGroups(applyGroups.manager)
, middleware.auth.allow('admin', 'sales', 'manager')
, routes.getAnalytics
);

// Locations.addProduct
server.post(
  '/v1/locations/:locationId/products'
, middleware.applyGroups(applyGroups.manager)
, middleware.auth.allow('admin', 'sales', 'manager')
, middleware.validate.body(null, { productId:{ isInt:[] }, isSpotlight:{ is:/true|false|1|0/ }})
, routes.addProduct
);

// Locations.updateProduct
server.put(
  '/v1/locations/:locationId/products/:productId'
, middleware.applyGroups(applyGroups.manager)
, middleware.auth.allow('admin', 'sales', 'manager')
, middleware.validate.body(null, { isSpotlight:{ is:/true|false|1|0/ }})
, routes.updateProduct
);

// Locations.removeProduct
server.del(
  '/v1/locations/:locationId/products/:productId'
, middleware.applyGroups(applyGroups.manager)
, middleware.auth.allow('admin', 'sales', 'manager')
, routes.removeProduct
);

module.exports = server;