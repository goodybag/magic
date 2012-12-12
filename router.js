/*
  Router
*/

var
  // Module Dependencies
  routes    = require('./routes')
, validate  = require('./middleware/routes-validator').routes
, auth      = require('./middleware/auth')
, fields    = require('./middleware/fields')

  // Module Variables
, router    = {}
;

router.init = function(app){
  // app.post('/v1/consumers',        validate.consumer.register,   routes.v1.consumers.register);
  // app.post('/v1/consumers/auth',   validate.consumer.auth,       routes.v1.consumers.auth);
  // app.get ('/v1/consumers/auth',                                 routes.v1.consumers.session);
  // app.get ('/v1/consumers/logout',                               routes.v1.consumers.logout);
  // app.post('/v1/consumers/auth/facebook',                        routes.v1.consumers.fbAuth);
  // app.get ('/v1/consumers/tapins', auth,                         routes.v1.consumers.tapins);

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

  // app.get(
  //   '/v1/businesses/:businessId'
  // , fields('businesses')
  // , routes.v1.businesses.findOne
  // );

  // app.get(
  //   '/v1/businesses/:businessId/goodies'
  // , fields('goodies')
  // , routes.v1.businesses.goodies
  // );
};

module.exports = router;