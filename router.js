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
    //Users
  app.post('/v1/users', routes.v1.users.list) ;


  // app.post('/v1/consumers',        validate.consumer.register,   routes.v1.consumers.register);
  // app.post('/v1/consumers/auth',   validate.consumer.auth,       routes.v1.consumers.auth);
  // app.get ('/v1/consumers/auth',                                 routes.v1.consumers.session);
  // app.get ('/v1/consumers/logout',                               routes.v1.consumers.logout);
  // app.post('/v1/consumers/auth/facebook',                        routes.v1.consumers.fbAuth);
  // app.get ('/v1/consumers/tapins', auth,                         routes.v1.consumers.tapins);

  // Businesses
  app.get ('/v1/businesses', fields('businesses'),                routes.v1.businesses.list);
  app.get ('/v1/businessesWithLocations',                         routes.v1.businesses.listWithLocations);
  // app.post('/v1/businesses',                                      routes.v1.businesses.save);
  // app.get ('/v1/businesses/:businessId',                          routes.v1.businesses.findOne);
  // app.get ('/v1/businesses/:businessId/goodies',                  routes.v1.businesses.goodies);
};

module.exports = router;