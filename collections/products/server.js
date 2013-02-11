/**
 * Products server
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var schema = require('../../db').schemas.products;
var permissions = require('./permissions');

// Products.list
server.get(
  '/v1/products'
, middleware.profile('GET /v1/products', ['include','limit','sort'])
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
    locationId : { isInt:[] },
    tag        : { is:/[A-z\!\,]+/ },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
    include    : { isIn:[['tags','categories']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list products handler')
, routes.list
);

// Products.list
server.get(
  '/v1/locations/:locationId/products'
, middleware.profile('GET /v1/locations/:locationId/products', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    tag        : { is:/[A-z\!\,]+/ },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
    include    : { isIn:[['tags','categories']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list products handler')
, routes.list
);

// Products.list
server.get(
  '/v1/businesses/:businessId/products'
, middleware.profile('GET /v1/businesses/:businessId/products', ['include','limit','sort'])
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
    locationId : { isInt:[] },
    tag        : { isAlpha:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
    include    : { isIn:[['tags','categories']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list products handler')
, routes.list
);

// Products.list
server.get(
  '/v1/products/food'
, middleware.profile('GET /v1/products/food', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    locationId : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
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
, middleware.profile('list products handler')
, routes.list
);

// Products.list
server.get(
  '/v1/products/fashion'
, middleware.profile('GET /v1/products/fashion', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    locationId : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
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
, middleware.profile('list products handler')
, routes.list
);

// Products.list
server.get(
  '/v1/products/other'
, middleware.profile('GET /v1/products/other', ['include','limit','sort'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    locationId : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
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
, middleware.profile('list products handler')
, routes.list
);

// Products.create
server.post(
  '/v1/products'
, middleware.profile('POST /v1/products')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('create product handler')
, routes.create
);

// Products.get
server.get(
  '/v1/products/:productId'
, middleware.profile('GET /v1/products/:productId')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get product handler')
, routes.get
);

// Products.update
server.put(
  '/v1/products/:productId'
, middleware.profile('PUT /v1/products/:productId')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update product handler')
, routes.update
);

// Products.update
server.post(
  '/v1/products/:productId'
, middleware.profile('POST /v1/products/:productId')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('validate body')
, middleware.validate.body(schema)
, middleware.profile('update product handler')
, routes.update
);

// Products.delete
server.del(
  '/v1/products/:productId'
, middleware.profile('DELETE /v1/products/:productId')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('delete product handler')
, routes.del
);

// Products.listCategories
server.get(
  '/v1/products/:productId/categories'
, middleware.profile('GET /v1/products/:productId/categories')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list product categories handler')
, routes.listCategories
);

// Products.addCategory
server.post(
  '/v1/products/:productId/categories'
, middleware.profile('POST /v1/products/:productId/categories')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('add product category handler')
, routes.addCategory
);

// Products.delCategory
server.del(
  '/v1/products/:productId/categories/:categoryId'
, middleware.profile('DELETE /v1/products/:productId/categories/:categoryId')
, middleware.profile('delete product category handler')
, routes.delCategory
);

// Products.updateFeelings
server.post(
  '/v1/products/:productId/feelings'
, middleware.profile('POST /v1/products/:productId/feelings')
, middleware.profile('update product feelings handler')
, routes.updateFeelings
);

module.exports = server;