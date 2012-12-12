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
  app.get(
    '/v1/businesses'
  , fields('businesses')
  , routes.v1.businesses.list
  );

  app.post(
    '/v1/businesses'
  , validate.businesses.create
  , routes.v1.businesses.create
  );

  app.put(
    '/v1/businesses/:id'
  , validate.businesses.update
  , routes.v1.businesses.update
  );

  app.post(
    '/v1/businesses/:id'
  , validate.businesses.update
  , routes.v1.businesses.update
  );

  app.get(
    '/v1/businessesWithLocations'
  , routes.v1.businesses.listWithLocations
  );


  /**
   * Locations
   */
  app.get(
    '/v1/locations'
  , fields('locations')
  , routes.v1.locations.list
  );

  app.get(
    '/v1/businesses/:businessId/locations'
  , fields('locations')
  , routes.v1.locations.list
  );

  app.post(
    '/v1/locations'
  , fields('locations')
  , routes.v1.locations.create
  );

  app.get(
    '/v1/locations/:locationId'
  , fields('locations')
  , routes.v1.locations.get
  );

  app.patch(
    '/v1/locations/:locationId'
  , fields('locations')
  , routes.v1.locations.update
  );

  app.del(
    '/v1/locations/:locationId'
  , fields('locations')
  , routes.v1.locations.del
  );
};

module.exports = router;