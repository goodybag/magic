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
  // , auth.allow('admin')
  , routes.v1.businesses.del
  );

  // Businesses.create
  app.post(
    '/v1/businesses'
  // , auth.allow('admin', 'sales')
  , validate.businesses.create
  , routes.v1.businesses.create
  );

  // Businesses.update
  app.put(
    '/v1/businesses/:id'
  // , auth.allow('admin', 'sales')
  , validate.businesses.update
  , routes.v1.businesses.update
  );

  // Businesses.update
  app.post(
    '/v1/businesses/:id'
  // , auth.allow('admin', 'sales')
  , validate.businesses.update
  , routes.v1.businesses.update
  );

  // Businesses.listWithLocations - STUPID METHOD
  app.get(
    '/v1/businessesWithLocations'
  // , auth.allow('admin', 'sales')
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
  // , auth.allow('admin', 'sales')
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
  // , auth.allow('admin', 'sales')
  , fields('locations')
  , validate.locations.update
  , routes.v1.locations.update
  );

  // Locations.update
  app.put(
    '/v1/locations/:locationId'
  // , auth.allow('admin', 'sales')
  , fields('locations')
  , validate.locations.update
  , routes.v1.locations.update
  );

  // Locations.update
  app.post(
    '/v1/locations/:locationId'
  // , auth.allow('admin', 'sales')
  , fields('locations')
  , validate.locations.update
  , routes.v1.locations.update
  );

  // Locations.delete
  app.del(
    '/v1/locations/:locationId'
  // , auth.allow('admin', 'sales')
  , fields('locations')
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
  , validate.users.create
  , routes.v1.users.create
  );
};

module.exports = router;