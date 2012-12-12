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