/**
 * Products server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var schema = require('../../db').schemas.products;
var fields = require('./fields');

// Products.list
server.get(
  '/v1/products'
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    businessId : { isInt:[] },
    sort       : { is:/(\+|-)?(name|distance|popular|random)/ },
    offset     : { isInt:[], min:[0] },
    test       : { is:/(foo|bar)/ },
    limit      : { isInt:[], min:[1] }
  })
, middleware.fields(fields.access.products)
, routes.list
);

// Products.list
server.get(
  '/v1/businesses/:businessId/products'
, middleware.validate.path({
    businessId : { isInt:[] }
  })
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    sort       : { is:/(\+|-)?(name|distance|popular|random)/ },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.fields(fields.access.products)
, routes.list
);

// Products.create
server.post(
  '/v1/products'
, middleware.fields(fields.create.product)
, middleware.validate.body(schema)
, routes.create
);

// Products.get
server.get(
  '/v1/products/:productId'
, middleware.fields(fields.access.product)
, routes.get
);

// Products.update
server.patch(
  '/v1/products/:productId'
, middleware.fields(fields.mutate.product)
, middleware.validate.body(schema)
, routes.update
);

// Products.update
server.post(
  '/v1/products/:productId'
, middleware.fields(fields.mutate.product)
, middleware.validate.body(schema)
, routes.update
);

// Products.delete
server.del(
  '/v1/products/:productId'
, middleware.auth.allow('admin', 'sales')
, routes.del
);

// Products.listCategories
server.get(
  '/v1/products/:productId/categories'
, middleware.fields(fields.access.productCategory)
, routes.listCategories
);

// Products.addCategory
server.post(
  '/v1/products/:productId/categories'
, middleware.fields(fields.create.productCategory)
, routes.addCategory
);

// Products.delCategory
server.del(
  '/v1/products/:productId/categories/:categoryId'
, routes.delCategory
);

// Products.updateFeelings
server.post(
  '/v1/products/:productId/feelings'
, routes.updateFeelings
);

module.exports = server;