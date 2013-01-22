var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
;

describe('POST /v1/redemptions', function() {

  it('should update the consumer stats and create a redemption', function(done) {
    // :TODO: pending cashiers and tapinStations
    // tu.login({ email:'consumer2@gmail.com', password:'password' }, function() {
    //   tu.post('/v1/loyaltyStats', { deltaPunches:5 }, function(err, payload, res) {
    //     assert(!err);
    //     assert(res.statusCode == 200);

    //     tu.get('/v1/loyaltyStats', function(err, payload, res) {
    //       assert(!err);
    //       assert(res.statusCode == 200);

    //       payload = JSON.parse(payload);
    //       assert(!payload.error);
    //       assert(payload.data.numPunches === 10);
    //       assert(payload.data.totalPunches === 28);
    //       assert(payload.data.visitCount === 40);
    //       tu.logout(done);
    //     });
    //   });
    // });
  });

  it('should not allow a redemption if the user is short on punches', function(done) {
    // :TODO: pending cashiers and tapinStations
    // tu.login({ email:'consumer3@gmail.com', password:'password' }, function() {
    //   tu.post('/v1/loyaltyStats', { deltaPunches:5 }, function(err, payload, res) {
    //     assert(!err);
    //     assert(res.statusCode == 200);

    //     tu.get('/v1/loyaltyStats', function(err, payload, res) {
    //       assert(!err);
    //       assert(res.statusCode == 200);

    //       payload = JSON.parse(payload);
    //       assert(!payload.error);
    //       assert(payload.data.numPunches === 5);
    //       assert(payload.data.totalPunches === 5);
    //       assert(payload.data.visitCount === 0);
    //       tu.logout(done);
    //     });
    //   });
    // });
  });

  it('should respond to an invalid payload with errors', function(done) {
    // :TODO: pending cashiers and tapinStations
    // tu.login({ email:'consumer2@gmail.com', password:'password' }, function() {
    //   tu.post('/v1/loyaltyStats', { deltaPunches:'asdf' }, function(err, payload, res) {
    //     assert(!err);
    //     assert(res.statusCode == 400);

    //     tu.logout(done);
    //   });
    // });
  });

  it('should allow business owners to make changes via tapin auth'); // :TODO:
});

describe('GET /v1/redemptions', function() {

  it('should respond with all redemptions', function(done) {
    // :TODO: pending cashiers and tapinStations
    // tu.login({ email:'consumer2@gmail.com', password:'password' }, function() {
    //   tu.get('/v1/loyaltyStats', function(err, payload, res) {
    //     assert(!err);
    //     assert(res.statusCode == 200);

    //     payload = JSON.parse(payload);
    //     assert(!payload.error);
    //     assert(payload.data.numPunches === 5);
    //     assert(payload.data.totalPunches === 23);
    //     assert(payload.data.visitCount === 40);
    //     tu.logout(done);
    //   });
    // });
  });

  it('should filter by business', function(done)
    // :TODO: pending cashiers and tapinStations {
    // tu.login({ email:'consumer2@gmail.com', password:'password' }, function() {
    //   tu.get('/v1/loyaltyStats', function(err, payload, res) {
    //     assert(!err);
    //     assert(res.statusCode == 200);

    //     payload = JSON.parse(payload);
    //     assert(!payload.error);
    //     assert(payload.data.numPunches === 5);
    //     assert(payload.data.totalPunches === 23);
    //     assert(payload.data.visitCount === 40);
    //     tu.logout(done);
    //   });
    // });
  });
});