/**
 * ProductTags server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var schema = require('../../db').schemas.productTags;
var permissions = require('./permissions');

// ProductTags.list
server.get(
  '/v1/product-tags'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.permissions(permissions)
, routes.list
);

// ProductTags.list
server.get(
  '/v1/businesses/:businessId/product-tags'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.permissions(permissions)
, routes.list
);

// ProductTags.get
server.get(
  '/v1/product-tags/:tagId'
, middleware.permissions(permissions)
, routes.get
);

// ProductTags.get
server.get(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.permissions(permissions)
, routes.get
);

// ProductTags.create
server.post(
  '/v1/businesses/:businessId/product-tags'
, middleware.validate.body(schema)
, middleware.permissions(permissions)
, routes.create
);

// ProductTags.update
server.put(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.validate.body(schema)
, middleware.permissions(permissions)
, routes.update
);

// ProductTags.update
server.post(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.validate.body(schema)
, middleware.permissions(permissions)
, routes.update
);

// ProductTags.delete
server.del(
  '/v1/businesses/:businessId/product-tags/:tagId'
, middleware.auth.allow('admin', 'sales')
, middleware.permissions(permissions)
, routes.del
);

module.exports = server;