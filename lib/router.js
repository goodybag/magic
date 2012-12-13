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

    //Users


  // app.post('/v1/users',routes.v1.users.create);
  // app.post('/v1/consumers/auth',   validate.consumer.auth,       routes.v1.consumers.auth);
  // app.get ('/v1/consumers/auth',                                 routes.v1.consumers.session);
  // app.get ('/v1/consumers/logout',                               routes.v1.consumers.logout);
  // app.post('/v1/consumers/auth/facebook',                        routes.v1.consumers.fbAuth);
  // app.get ('/v1/consumers/tapins', auth,                         routes.v1.consumers.tapins);

  // Businesses
//  app.get ('/v1/businesses', fields('businesses'),                routes.v1.businesses.list);
//  app.get ('/v1/businessesWithLocations',                         routes.v1.businesses.listWithLocations);
  // app.post('/v1/businesses',                                      routes.v1.businesses.save);
  // app.get ('/v1/businesses/:businessId',                          routes.v1.businesses.findOne);
  // app.get ('/v1/businesses/:businessId/goodies',                  routes.v1.businesses.goodies);

  // Locations
//  app.get  ('/v1/locations',                        fields('locations'), routes.v1.locations.list);
//  app.get  ('/v1/businesses/:businessId/locations', fields('locations'), routes.v1.locations.list);
//  app.post ('/v1/locations',                        fields('locations'), routes.v1.locations.create);
//  app.get  ('/v1/locations/:locationId',            fields('locations'), routes.v1.locations.get);
//  app.patch('/v1/locations/:locationId',            fields('locations'), routes.v1.locations.update);
//  app.del  ('/v1/locations/:locationId',            fields('locations'), routes.v1.locations.del);

    /**
     * Users
     */
    // Users.create
    app.post(
        '/v1/users'
        , validate.users.create
        , routes.v1.users.create
    );




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
  , routes.v1.businesses.del
  );

  // Businesses.create
  app.post(
    '/v1/businesses'
  , validate.businesses.create
  , routes.v1.businesses.create
  );

  // Businesses.update
  app.put(
    '/v1/businesses/:id'
  , validate.businesses.update
  , routes.v1.businesses.update
  );

  // Businesses.update
  app.post(
    '/v1/businesses/:id'
  , validate.businesses.update
  , routes.v1.businesses.update
  );

  // Businesses.listWithLocations - STUPID METHOD
  app.get(
    '/v1/businessesWithLocations'
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
  , fields('locations')
  , validate.locations.update
  , routes.v1.locations.update
  );

  // Locations.update
  app.put(
    '/v1/locations/:locationId'
  , fields('locations')
  , validate.locations.update
  , routes.v1.locations.update
  );

  // Locations.update
  app.post(
    '/v1/locations/:locationId'
  , fields('locations')
  , validate.locations.update
  , routes.v1.locations.update
  );

  // Locations.delete
  app.del(
    '/v1/locations/:locationId'
  , fields('locations')
  , routes.v1.locations.del
  );

};

module.exports = router;