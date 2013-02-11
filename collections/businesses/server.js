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
, middleware.profile('GET /v1/businesses', ['include','limit'])
, middleware.profile('validate query')
, middleware.defaults.query({
    limit : 20
  })
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
, middleware.profile('GET /v1/businesses/food', ['include','limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name']] },
    include    : { isIn:[['locations','tags']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('query defaults')
, middleware.defaults.query({
    tag : ['food']
  })
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('list businesses handler')
, routes.list
);

// Businesses.list
server.get(
  '/v1/businesses/fashion'
, middleware.profile('GET /v1/businesses/fashion', ['include','limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name']] },
    include    : { isIn:[['locations','tags']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('query defaults')
, middleware.defaults.query({
    tag   : ['apparel']
  })
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('list businesses handler')
, routes.list
);

// Businesses.list
server.get(
  '/v1/businesses/other'
, middleware.profile('GET /v1/businesses/other', ['include','limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name']] },
    include    : { isIn:[['locations','tags']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('query defaults')
, middleware.defaults.query({
    tag : ['!food,!apparel']
  })
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('list businesses handler')
, routes.list
);

// Businesses.get
server.get(
  '/v1/businesses/:id'
, middleware.profile('GET /v1/businesses/:id')
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('get business handler')
, routes.get
);


// Businesses.loyalty.get
server.get(
  '/v1/businesses/:id/loyalty'
, middleware.profile('GET /v1/businesses/:id/loyalty')
, middleware.profile('get business loyalty handler')
, routes.getLoyalty
);

// Businesses.loyalty.patch
server.put(
  '/v1/businesses/:id/loyalty'
, middleware.profile('PUT /v1/businesses/:id/loyalty')
, middleware.profile('apply groups businesses ownerManager')
, middleware.applyGroups(applyGroups.ownerManager)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'ownerManager')
, middleware.profile('permissions')
, middleware.permissions(permissions.loyalty)
, middleware.profile('update business loyalty handler')
, routes.updateLoyalty
);

// Businesses.del
server.del(
  '/v1/businesses/:id'
, middleware.profile('DELETE /v1/businesses/:id')
, middleware.profile('auth allow')
, middleware.auth.allow('admin')
, middleware.profile('delete business handler')
, routes.del
);

// Businesses.create
server.post(
  '/v1/businesses'
, middleware.profile('POST /v1/businesses')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('create business handler')
, routes.create
);

// Businesses.update
server.put(
  '/v1/businesses/:id'
, middleware.profile('PUT /v1/businesses/:id')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update business handler')
, routes.update
);

module.exports = server;