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
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    businessId : { isInt:[] },
    tag        : { is:/[A-z\!\,]+/ },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
    include    : { isIn:[['tags','categories']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.permissions(permissions)
, routes.list
);

// Products.list
server.get(
  '/v1/locations/:locationId/products'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    tag        : { is:/[A-z\!\,]+/ },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
    include    : { isIn:[['tags','categories']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.permissions(permissions)
, routes.list
);

// Products.list
server.get(
  '/v1/businesses/:businessId/products'
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
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
    include    : { isIn:[['tags','categories']] },
    offset     : { isInt:[], min:[0] },
    limit      : { isInt:[], min:[1] }
  })
, middleware.permissions(permissions)
, routes.list
);

// Products.list
server.get(
  '/v1/products/food'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
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

// Products.list
server.get(
  '/v1/products/fashion'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
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

// Products.list
server.get(
  '/v1/products/other'
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate.query({
    lat        : { isFloat:[] },
    lon        : { isFloat:[] },
    range      : { isInt:[] },
    tag        : { isNull:[] },
    sort       : { isIn:[['-name','name','-distance','distance','-random','random','-popular','popular']] },
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

// Products.create
server.post(
  '/v1/products'
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.create
);

// Products.get
server.get(
  '/v1/products/:productId'
, middleware.permissions(permissions)
, routes.get
);

// Products.update
server.put(
  '/v1/products/:productId'
, middleware.permissions(permissions)
, middleware.validate.body(schema)
, routes.update
);

// Products.update
server.post(
  '/v1/products/:productId'
, middleware.permissions(permissions)
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
, middleware.permissions(permissions)
, routes.listCategories
);

// Products.addCategory
server.post(
  '/v1/products/:productId/categories'
, middleware.permissions(permissions)
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