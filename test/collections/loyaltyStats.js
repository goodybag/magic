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
        assert(payload.data[0].isRegistered === true);
        tu.logout(done);
      });
    });
  });

  it('should respond with an empty array if stats dont not exist', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/loyaltyStats', function(err, payload, res) {
        assert(!err);
        payload = JSON.parse(payload);
        assert(!payload.error);
        assert(payload.data.length === 0);
        tu.logout(done);
      });
    });
  });

  it('should respond with a 401 if no user is logged in', function(done) {
    tu.get('/v1/loyaltyStats', function(err, payload, res) {
      assert(res.statusCode == 401);
      done();
    });
  });

  it('should give isRegistered false if no email or singly token', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/consumers/13/loyaltyStats', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data[0].isRegistered === false);
        tu.logout(done);
      });
    });
  });
});

describe('GET /v1/businesses/:businessId/loyaltyStats', function(){

  it('should perform a flash login, create a new user, and get the blank loyalty stats', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      assert(!error);

      tu.tapinAuthRequest('GET', '/v1/businesses/' + 1 + '/loyaltyStats', '667788-CBA', function(error, payload, res){
        assert(!error);
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(!payload.error);
        assert(payload.data == null);

        tu.logout(done);
      });
    });
  });

  it('should respond with stats', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      assert(!error);

      tu.tapinAuthRequest('GET', '/v1/businesses/' + 1 + '/loyaltyStats', '778899-CBA', function(error, payload, res){
        assert(!error);
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(!payload.error);

        assert(payload.data.consumerId == 10);
        assert(payload.data.businessId == 1);
        assert(payload.data.numPunches == 5);
        assert(payload.data.totalPunches == 23);
        assert(payload.data.visitCount == 40);
        assert(payload.data.reward == 'Chicken');
        assert(payload.data.photoUrl == 'http://placekitten.com/200/300');

        tu.logout(done);
      });
    });
  });

});

describe('POST /v1/loyaltyStats', function() {

  it('should update the consumer stats and make them elite', function(done) {
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      tu.post('/v1/loyaltyStats', { deltaPunches:5, consumerId:9, businessId:1, locationId:1 }, function(err, payload, res) {
        assert(res.statusCode == 200);
        tu.logout(function() {
          tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyaltyStats', function(err, payload, res) {
              assert(res.statusCode == 200);
              payload = JSON.parse(payload);
              assert(!payload.error);

              assert(payload.data[0].numPunches === 2);
              assert(payload.data[0].totalPunches === 28);
              assert(payload.data[0].numRewards === 1);
              assert(payload.data[0].isElite === true);
              tu.logout(done);
            });
          });
        })
      });
    });
  });

  it('should create the consumer stats if DNE', function(done) {
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      tu.post('/v1/loyaltyStats', { deltaPunches:5, consumerId:4, businessId:1, locationId:1 }, function(err, payload, res) {
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
      tu.tapinAuthRequest('POST', '/v1/loyaltyStats', '123456-XXX', { deltaPunches:5, businessId:1, locationId:1, consumerId:9 }, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);
        tu.logout(function() {
          tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyaltyStats', function(error, results, res) {
              assert(res.statusCode === 200);
              results = JSON.parse(results);
              assert(results.data[0].numPunches === 3);
              assert(results.data[0].totalPunches === 33);
              assert(results.data[0].numRewards === 2);

              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should allow business cashiers to make changes via tapin auth', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      tu.tapinAuthRequest('POST', '/v1/loyaltyStats', '123456-XYX', { deltaPunches:5, businessId:1, locationId:1, consumerId:9 }, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);
        tu.logout(function() {
          tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyaltyStats', function(error, results, res) {
              assert(res.statusCode === 200);
              results = JSON.parse(results);
              assert(results.data[0].numPunches === 0);
              assert(results.data[0].totalPunches === 38);
              assert(results.data[0].numRewards === 4);

              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should allow consumers to make changes via tapin auth', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      tu.tapinAuthRequest('POST', '/v1/loyaltyStats', '123456-consumer4', { deltaPunches:5, businessId:1, locationId:1, consumerId:9 }, function(error, results, res) {
        assert(res.statusCode === 403);
        tu.logout(done);
      });
    });
  });
});