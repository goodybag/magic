/*
  Router
*/

var
  // Module Dependencies
  routes    = require('../routes')
, validate  = require('../middleware/routes-validator').routes
, auth      = require('../middleware/auth')
, fields    = require('../middleware/fields')

  // Module Variables
, router    = {}
;

router.init = function(app){
  /**
   * Businesses
   */

  // Businesses.list
  app.get(
    '/v1/businesses'
  , fields('businesses')
  , routes.v1.businesses.list
  );

  // Businesses.get
  app.get(
    '/v1/businesses/:id'
  , fields('businesses')
  , routes.v1.businesses.get
  );

  // Businesses.del
  app.del(
    '/v1/businesses/:id'
  , auth.allow('admin')
  , routes.v1.businesses.del
  );

  // Businesses.create
  app.post(
    '/v1/businesses'
  , auth.allow('admin', 'sales')
  , validate.businesses.create
  , routes.v1.businesses.create
  );

  // Businesses.update
  app.put(
    '/v1/businesses/:id'
  , auth.allow('admin', 'sales')
  , validate.businesses.update
  , routes.v1.businesses.update
  );

  // Businesses.update
  app.patch(
    '/v1/businesses/:id'
  , validate.businesses.update
  , routes.v1.businesses.update
  );

  // Businesses.update
  app.post(
    '/v1/businesses/:id'
  , auth.allow('admin', 'sales')
  , validate.businesses.update
  , routes.v1.businesses.update
  );

  // Businesses.listWithLocations - STUPID METHOD
  app.get(
    '/v1/businessesWithLocations'
  , auth.allow('admin', 'sales')
  , routes.v1.businesses.listWithLocations
  );


  /**
   * Locations
   */

  // Locations.list
  app.get(
    '/v1/locations'
  , fields('locations')
  , routes.v1.locations.list
  );

  // Locations.list
  app.get(
    '/v1/businesses/:businessId/locations'
  , fields('locations')
  , routes.v1.locations.list
  );

  // Locations.create
  app.post(
    '/v1/locations'
  , auth.allow('admin', 'sales')
  , fields('locations')
  , validate.locations.create
  , routes.v1.locations.create
  );

  // Locations.get
  app.get(
    '/v1/locations/:locationId'
  , fields('locations')
  , routes.v1.locations.get
  );

  // Locations.update
  app.patch(
    '/v1/locations/:locationId'
  , auth.allow('admin', 'sales')
  , fields('locations')
  , validate.locations.update
  , routes.v1.locations.update
  );

  // Locations.update
  app.put(
    '/v1/locations/:locationId'
  , auth.allow('admin', 'sales')
  , fields('locations')
  , validate.locations.update
  , routes.v1.locations.update
  );

  // Locations.update
  app.post(
    '/v1/locations/:locationId'
  , auth.allow('admin', 'sales')
  , fields('locations')
  , validate.locations.update
  , routes.v1.locations.update
  );

  // Locations.delete
  app.del(
    '/v1/locations/:locationId'
  , auth.allow('admin', 'sales')
  , routes.v1.locations.del
  );

  /**
   * Users
   */

  // Users.get
  app.get(
    '/v1/users'
  , fields('users')
  , routes.v1.users.list
  );

  // Users.get
  app.get(
    '/v1/users/:id'
  , fields('users')
  , routes.v1.users.get
  );

  // Users.create
  app.post(
    '/v1/users'
  , routes.v1.users.create
  );

  /**
   * Users
   */

  // Users.list
  app.get(
    '/v1/users'
  , fields('users')
  , routes.v1.users.list
  );

  // Users.get
  app.get(
    '/v1/users/:id'
  , fields('users')
  , routes.v1.users.get
  );

  // Users.create
  app.post(
    '/v1/users'
  , validate.users.create
  , routes.v1.users.create
  );

  // Users.create
  app.post(
    '/v1/users/:id'
  , validate.users.update
  , routes.v1.users.update
  );

  app.del(
    '/v1/users/:id'
  , auth.allow('admin')
  , routes.v1.users.del
  );

  /**
   * Auth
   */

  app.get(
    '/v1/auth'
  , routes.v1.auth.session
  );

  app.post(
    '/v1/auth'
  , routes.v1.auth.authenticate
  );

  app.post(
    '/v1/oauth'
  , routes.v1.auth.oauthAuthenticate
  );

  app.get(
    '/v1/logout'
  , routes.v1.auth.logout
  );


  /**
   * Products
   */

  // Products.list
  app.get(
    '/v1/products'
  , fields('products')
  , routes.v1.products.list
  );

  // Products.list
  app.get(
    '/v1/businesses/:businessId/products'
  , fields('products')
  , routes.v1.products.list
  );

  // Products.create
  app.post(
    '/v1/products'
  , fields('products')
  , validate.products.create
  , routes.v1.products.create
  );

  // Products.get
  app.get(
    '/v1/products/:productId'
  , fields('products')
  , routes.v1.products.get
  );

  // Products.update
  app.patch(
    '/v1/products/:productId'
  , fields('products')
  , validate.products.update
  , routes.v1.products.update
  );

  // Products.update
  app.put(
    '/v1/products/:productId'
  , fields('products')
  , validate.products.update
  , routes.v1.products.update
  );

  // Products.update
  app.post(
    '/v1/products/:productId'
  , fields('products')
  , validate.products.update
  , routes.v1.products.update
  );

  // Products.delete
  app.del(
    '/v1/products/:productId'
  , fields('products')
  , routes.v1.products.del
  );
};

module.exports = router;