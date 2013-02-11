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
, middleware.profile('GET /v1/locations', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
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
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list locations handler')
, routes.list
);

// Locations.list
server.get(
  '/v1/businesses/:businessId/locations'
, middleware.profile('GET /v1/businesses/:businessId/locations', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate path')
, middleware.validate.path({
    businessId : { isInt:[] }
  })
, middleware.profile('validate query')
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
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list locations handler')
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/food'
, middleware.profile('GET /v1/locations/food', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
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
, middleware.profile('query defaults')
, middleware.defaults.query({
    tag : ['food']
  })
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list locations handler')
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/fashion'
, middleware.profile('GET /v1/locations/food', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
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
, middleware.profile('query defaults')
, middleware.defaults.query({
    tag : ['apparel']
  })
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list locations handler')
, routes.list
);

// Locations.list
server.get(
  '/v1/locations/other'
, middleware.profile('GET /v1/locations/food', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
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
, middleware.profile('query defaults')
, middleware.defaults.query({
    tag : ['!food,!apparel']
  })
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list locations handler')
, routes.list
);

// Locations.create
server.post(
  '/v1/locations'
, middleware.profile('POST /v1/locations')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('create location handler')
, routes.create
);

// Locations.get
server.get(
  '/v1/locations/:locationId'
, middleware.profile('GET /v1/locations/:locationId')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get location handler')
, routes.get
);

// Locations.update
server.put(
  '/v1/locations/:locationId'
, middleware.profile('PUT /v1/locations/:locationId')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update location handler')
, routes.update
);

// Locations.update
server.post(
  '/v1/locations/:locationId'
, middleware.profile('POST /v1/locations/:locationId')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update location handler')
, routes.update
);

// Locations.delete
server.del(
  '/v1/locations/:locationId'
, middleware.profile('DELETE /v1/locations/:locationId')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('delete location handler')
, routes.del
);

// Locations.getAnalytics
server.get(
  '/v1/locations/:locationId/analytics'
, middleware.profile('GET /v1/locations/:locationId/analytics')
, middleware.profile('apply groups locations manager')
, middleware.applyGroups(applyGroups.manager)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'manager')
, middleware.profile('get location analytics handler')
, routes.getAnalytics
);

// Locations.addProduct
server.post(
  '/v1/locations/:locationId/products'
, middleware.profile('GET /v1/locations/:locationId/products')
, middleware.profile('apply groups locations manager')
, middleware.applyGroups(applyGroups.manager)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'manager')
, middleware.profile('validate body')
, middleware.validate.body(null, { productId:{ isInt:[] }, isSpotlight:{ is:/true|false|1|0/ }})
, middleware.profile('add product to location handler')
, routes.addProduct
);

// Locations.updateProduct
server.put(
  '/v1/locations/:locationId/products/:productId'
, middleware.profile('PUT /v1/locations/:locationId/products/:productId')
, middleware.profile('apply groups locations manager')
, middleware.applyGroups(applyGroups.manager)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'manager')
, middleware.profile('validate body')
, middleware.validate.body(null, { isSpotlight:{ is:/true|false|1|0/ }})
, middleware.profile('update product at location handler')
, routes.updateProduct
);

// Locations.removeProduct
server.del(
  '/v1/locations/:locationId/products/:productId'
, middleware.profile('DELETE /v1/locations/:locationId/products/:productId')
, middleware.profile('apply groups locations manager')
, middleware.applyGroups(applyGroups.manager)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'manager')
, middleware.profile('remove product from location handler')
, routes.removeProduct
);

module.exports = server;