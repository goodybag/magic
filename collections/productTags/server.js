/**
 * ProductTags server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var validators = require('./validators');
var fields = require('./auth/fields');

// ProductTags.list
server.get(
  '/v1/productTags'
, middleware.fields(fields)
, routes.list
);

// ProductTags.list
server.get(
  '/v1/businesses/:businessId/tags'
, middleware.fields(fields)
, routes.list
);

// ProductTags.list
server.get(
  '/v1/products/:productId/tags'
, middleware.fields(fields)
, routes.list
);

// ProductTags.create
server.post(
  '/v1/productTags'
, middleware.validate(validators.create)
, routes.create
);

// ProductTags.get
server.get(
  '/v1/productTags/:productTagId'
, middleware.fields(fields)
, routes.get
);

// ProductTags.update
server.patch(
  '/v1/productTags/:productTagId'
, middleware.validate(validators.update)
, routes.update
);

// ProductTags.update
server.put(
  '/v1/productTags/:productTagId'
, middleware.validate(validators.update)
, routes.update
);

// ProductTags.update
server.post(
  '/v1/productTags/:productTagId'
, middleware.validate(validators.update)
, routes.update
);

// ProductTags.delete
server.del(
  '/v1/productTags/:productTagId'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

module.exports = server;