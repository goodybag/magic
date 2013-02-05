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
, middleware.profile('/v1/businesses', ['include','limit'])
, middleware.profile('validate query')
, middleware.validate.query({
    tag        : { isAlpha:[] },
    sort       : { isIn:[['-name','name']] },
    include    : { isIn:[['locations','tags']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('list businesses handler')
, routes.list
);

// Businesses.list
server.get(
  '/v1/businesses/food'
, middleware.validate.query({
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name']] },
    include    : { isIn:[['locations','tags']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.defaults.query({
    tag : ['food']
  })
, middleware.permissions(permissions.business)
, routes.list
);

// Businesses.list
server.get(
  '/v1/businesses/fashion'
, middleware.validate.query({
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name']] },
    include    : { isIn:[['locations','tags']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.defaults.query({
    tag : ['apparel']
  })
, middleware.permissions(permissions.business)
, routes.list
);

// Businesses.list
server.get(
  '/v1/businesses/other'
, middleware.validate.query({
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name']] },
    include    : { isIn:[['locations','tags']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.defaults.query({
    tag : ['!food,!apparel']
  })
, middleware.permissions(permissions.business)
, routes.list
);

// Businesses.get
server.get(
  '/v1/businesses/:id'
, middleware.profile('/v1/business/:id')
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('get business handler')
, routes.get
);


// Businesses.loyalty.get
server.get(
  '/v1/businesses/:id/loyalty'
, routes.getLoyalty
);

// Businesses.loyalty.patch
server.put(
  '/v1/businesses/:id/loyalty'
, middleware.applyGroups(applyGroups.ownerManager)
, middleware.auth.allow('admin', 'sales', 'ownerManager')
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
server.put(
  '/v1/businesses/:id'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions.business)
, middleware.validate.body(schema)
, routes.update
);

module.exports = server;