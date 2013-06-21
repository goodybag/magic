/**
 * Product Categories server
 */

var
  server      = require('express')()
, middleware  = require('../../middleware')
, routes      = require('./routes')
, permissions = require('./permissions')
, auth        = middleware.auth
, validate    = middleware.validate.body
, desc        = require('./description')
;

// ProductCategories.list
server.get(
  '/v1/product-categories'
, middleware.profile('GET /v1/product-categories')
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list product categories handler')
, routes.list
);

// ProductCategories.create
server.post(
  '/v1/product-categories'
, middleware.profile('POST /v1/product-categories')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create product category handler')
, routes.create
);

// ProductCategories.get
server.get(
  '/v1/product-categories/:id'
, middleware.profile('GET /v1/product-categories/:id')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get product category handler')
, routes.get
);

// ProductCategories.update
server.put(
  '/v1/product-categories/:id'
, middleware.profile('PUT /v1/product-categories/:id')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product category handler')
, routes.update
);

// ProductCategories.update
server.post(
  '/v1/product-categories/:id'
, middleware.profile('POST /v1/product-categories/:id')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product category handler')
, routes.update
);

// ProductCategories.delete
server.del(
  '/v1/product-categories/:id'
, middleware.profile('DELETE /v1/product-categories/:id')
, middleware.profile('auth allow')
, auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('delete product category handler')
, routes.del
);

// ProductCategories.list
server.get(
  '/v1/businesses/:businessId/product-categories'
, middleware.profile('GET /v1/businesses/:businessId/product-categories')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('list product categories handler')
, routes.list
);

var db = require('../../db');
var applyBusinessManager = function() {
  return function(req, res, next) {
    
    //do nothing if user not authenticated
    if(!req.session || !req.session.user) return next();
    var user = req.session.user;

    //do nothing if user is not a manager
    var isManager = user.groups.indexOf('manager') > -1;
    if(!isManager) return next();
    
    //lookup user manager record(s) for user
    db.query('SELECT * FROM managers WHERE id = $1', [user.id], function(error, rows) {
      if(error) return next(error);
      for(var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if(row.businessId == req.params.businessId) {
          user.groups.push('businessManager');
          break;
        }
      }
      next();
    });
  };
};

// ProductCategories.create
server.post(
  '/v1/businesses/:businessId/product-categories'
, middleware.profile('POST /v1/businesses/:businessId/product-categories')
, middleware.profile('auth allow')
, applyBusinessManager('businessId')
, auth.allow('admin', 'sales', 'businessManager')
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('create product category handler')
, routes.create
);

// ProductCategories.get
server.get(
  '/v1/businesses/:businessId/product-categories/:id'
, middleware.profile('GET /v1/businesses/:businessId/product-categories/:id')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('get product category handler')
, routes.get
);

// ProductCategories.update
server.put(
  '/v1/businesses/:businessId/product-categories/:id'
, middleware.profile('PUT /v1/businesses/:businessId/product-categories/:id')
, middleware.profile('auth allow')
, applyBusinessManager('businessId')
, auth.allow('admin', 'sales', 'businessManager')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product category handler')
, routes.update
);

// ProductCategories.update
server.post(
  '/v1/businesses/:businessId/product-categories/:id'
, middleware.profile('POST /v1/businesses/:businessId/product-categories/:id')
, middleware.profile('auth allow')
, applyBusinessManager('businessId')
, auth.allow('admin', 'sales', 'businessManager')
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('update product category handler')
, routes.update
);

// ProductCategories.delete
server.del(
  '/v1/businesses/:businessId/product-categories/:id'
, middleware.profile('DELETE /v1/businesses/:businessId/product-categories/:id')
, middleware.profile('auth allow')
, applyBusinessManager('businessId')
, auth.allow('admin', 'sales', 'businessManager')
, middleware.profile('permissions')
, middleware.permissions(permissions)
, middleware.profile('delete product category handler')
, routes.del
);

module.exports = server;
