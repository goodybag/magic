var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
;

describe('GET /v1/loyaltyStats', function() {

  it('should respond with stats', function(done) {
    tu.login({ email:'consumer2@gmail.com', password:'password' }, function() {
      tu.get('/v1/loyaltyStats', function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);
        assert(!payload.error);
        assert(payload.data[0].numPunches === 5);
        assert(payload.data[0].totalPunches === 23);
        assert(payload.data[0].visitCount === 40);
        tu.logout(done);
      });
    });
  });

  it('should respond 404 if target user is not a consumer', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/loyaltyStats', function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 404);
        tu.logout(done);
      });
    });
  });
});

describe('POST /v1/loyaltyStats', function() {

  it('should update the consumer stats', function(done) {
    tu.login({ email:'consumer2@gmail.com', password:'password' }, function() {
      tu.post('/v1/loyaltyStats', { deltaPunches:5, businessId:1 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 200);

        tu.get('/v1/loyaltyStats', function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);
          assert(!payload.error);
          assert(payload.data[0].numPunches === 10);
          assert(payload.data[0].totalPunches === 28);
          tu.logout(done);
        });
      });
    });
  });

  it('should create the consumer stats if DNE', function(done) {
    tu.login({ email:'consumer3@gmail.com', password:'password' }, function() {
      tu.post('/v1/loyaltyStats', { deltaPunches:5, businessId:1 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 200);

        tu.get('/v1/loyaltyStats', function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);
          assert(!payload.error);
          assert(payload.data[0].numPunches === 5);
          assert(payload.data[0].totalPunches === 5);
          assert(payload.data[0].visitCount === 0);
          tu.logout(done);
        });
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.login({ email:'consumer2@gmail.com', password:'password' }, function() {
      tu.post('/v1/loyaltyStats', { deltaPunches:'asdf' }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 400);

        tu.logout(done);
      });
    });
  });

  it('should allow business owners to make changes via tapin auth'); // :TODO:
});