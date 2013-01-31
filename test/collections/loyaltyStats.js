var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
;

describe('GET /v1/loyaltyStats', function() {

  it('should respond with stats', function(done) {
    tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
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
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      tu.post('/v1/loyaltyStats', { deltaPunches:5, consumerId:9, businessId:1 }, function(err, payload, res) {
        assert(res.statusCode == 200);
        tu.logout(function() {
          tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyaltyStats', function(err, payload, res) {
              assert(res.statusCode == 200);
              payload = JSON.parse(payload);
              assert(!payload.error);
              assert(payload.data[0].numPunches === 10);
              assert(payload.data[0].totalPunches === 28);
              tu.logout(done);
            });
          });
        })
      });
    });
  });

  it('should create the consumer stats if DNE', function(done) {
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      tu.post('/v1/loyaltyStats', { deltaPunches:5, consumerId:4, businessId:1 }, function(err, payload, res) {
        assert(res.statusCode == 200);
        tu.logout(function() {
          tu.login({ email:'consumer3@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyaltyStats', function(err, payload, res) {
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
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      tu.post('/v1/loyaltyStats', { businessId:1, consumerId:9, deltaPunches:'asdf' }, function(err, payload, res) {
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });

  it('should allow business managers to make changes via tapin auth', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      tu.tapinAuthRequest('POST', '/v1/loyaltyStats', '123456-XXX', { deltaPunches:5, businessId:1, consumerId:9 }, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);
        tu.logout(function() {
          tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyaltyStats', function(error, results, res) {
              assert(res.statusCode === 200);
              results = JSON.parse(results);
              assert(results.data[0].numPunches === 15);
              assert(results.data[0].totalPunches === 33);

              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should allow business cashiers to make changes via tapin auth', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      tu.tapinAuthRequest('POST', '/v1/loyaltyStats', '123456-XYX', { deltaPunches:5, businessId:1, consumerId:9 }, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);
        tu.logout(function() {
          tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyaltyStats', function(error, results, res) {
              assert(res.statusCode === 200);
              results = JSON.parse(results);
              assert(results.data[0].numPunches === 20);
              assert(results.data[0].totalPunches === 38);

              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should allow consumers to make changes via tapin auth', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      tu.tapinAuthRequest('POST', '/v1/loyaltyStats', '123456-consumer4', { deltaPunches:5, businessId:1, consumerId:9 }, function(error, results, res) {
        assert(res.statusCode === 403);
        tu.logout(done);
      });
    });
  });
});