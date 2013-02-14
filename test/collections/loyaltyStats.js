var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
;

describe('GET /v1/loyalty', function() {
  it('should respond with stats', function(done) {
    tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
      tu.get('/v1/loyalty', function(err, payload, res) {
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

  it('should respond with stats', function(done) {
    tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
      tu.get('/v1/loyalty/2', function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(!payload.error);
        assert(payload.data.numPunches);
        assert(payload.data.totalPunches);
        assert(payload.data.visitCount);
        tu.logout(done);
      });
    });
  });

  it('should respond with an empty array if stats dont not exist', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/loyalty', function(err, payload, res) {
        assert(!err);
        payload = JSON.parse(payload);
        assert(!payload.error);
        assert(payload.data.length === 0);
        tu.logout(done);
      });
    });
  });

  it('should respond with a 401 if no user is logged in', function(done) {
    tu.get('/v1/loyalty', function(err, payload, res) {
      assert(res.statusCode == 401);
      done();
    });
  });

  it('should give isRegistered false if no email or singly token', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/consumers/13/loyalty', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data[0].isRegistered === false);
        tu.logout(done);
      });
    });
  });
});

describe('GET /v1/loyalty/businesses/:businessId', function(){

  it('should perform a flash login, create a new user, and get the new blank loyalty stats', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      assert(!error);

      tu.tapinAuthRequest('GET', '/v1/loyalty/businesses/' + 1, '667788-CBA', function(error, payload, res){
        assert(!error);
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(!payload.error);

        assert(payload.data.businessId == 1);
        assert(payload.data.numPunches == 0);
        assert(payload.data.totalPunches == 0);

        assert(payload.meta.isFirstTapin == true);
        assert(payload.meta.consumerId);

        tu.logout(done);
      });
    });
  });

  it('should perform a flash login, get the blank loyalty stats, without the firstTapin flag', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      assert(!error);

      tu.tapinAuthRequest('GET', '/v1/loyalty/businesses/' + 1, '667788-CBA', function(error, payload, res){
        assert(!error);
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(!payload.error);
        assert(!payload.meta || !payload.meta.isFirstTapin);

        tu.logout(done);
      });
    });
  });

  it('should respond with stats', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      assert(!error);

      tu.tapinAuthRequest('GET', '/v1/loyalty/businesses/' + 1, '778899-CBA', function(error, payload, res){
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

  it('should respond with record not found for businesses that do not exist', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      assert(!error);

      tu.tapinAuthRequest('GET', '/v1/loyalty/businesses/' + 999999999, '778899-CBA', function(error, payload, res){
        assert(!error);
        assert(res.statusCode == 404);
        payload = JSON.parse(payload);
        assert(payload.error);
        assert(payload.error.name === "NOT_FOUND");

        tu.logout(done);
      });
    });
  });

  it('should respond with record not found for businesses that do have not setup their loyalty program', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      assert(!error);

      tu.tapinAuthRequest('GET', '/v1/loyalty/businesses/' + 5, '778899-CBA', function(error, payload, res){
        assert(!error);
        assert(res.statusCode == 404);
        payload = JSON.parse(payload);
        assert(payload.error);
        assert(payload.error.name === "NOT_FOUND");

        tu.logout(done);
      });
    });
  });

});

describe('PUT /v1/loyalty/:loyaltyId', function() {

  it('should update the consumers stats', function(done){
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function(error, user) {
      tu.put('/v1/loyalty/2', { deltaPunches:0, locationId:1 }, function(err, payload, res) {
        payload = JSON.parse(payload);
        assert(res.statusCode == 200);
        tu.get('/v1/loyalty/2', function(err, payload, res) {
          assert(res.statusCode == 200);
          payload = JSON.parse(payload);
          assert(!payload.error);

          assert(payload.data.numPunches);
          assert(payload.data.totalPunches);
          tu.logout(done);
        });
      });
    });
  });

});

describe('PUT /v1/consumers/:consumerId/loyalty/:businessId', function() {

  it('should update the consumer stats and make them elite', function(done) {
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      var consumerId = 9, businessId = 1;
      tu.put('/v1/consumers/' + consumerId + '/loyalty/' + businessId, { deltaPunches:5, locationId:1 }, function(err, payload, res) {
        assert(res.statusCode == 200);
        tu.logout(function() {
          tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyalty/businesses/' + businessId, function(err, payload, res) {
              assert(res.statusCode == 200);
              payload = JSON.parse(payload);
              assert(!payload.error);

              assert(payload.data.numPunches === 2);
              assert(payload.data.totalPunches === 28);
              assert(payload.data.numRewards === 1);
              assert(payload.data.isElite === true);
              tu.logout(done);
            });
          });
        })
      });
    });
  });

  it('should create the consumer stats if DNE', function(done) {
    var consumerId = 4, businessId = 1;
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      tu.put('/v1/consumers/' + consumerId + '/loyalty/' + businessId, { deltaPunches:5, locationId:1 }, function(err, payload, res) {
        assert(res.statusCode == 200);
        tu.logout(function() {
          tu.login({ email:'consumer3@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyalty/businesses/' + businessId, function(err, payload, res) {
              assert(res.statusCode == 200);
              payload = JSON.parse(payload);
              assert(!payload.error);
              assert(payload.data.numPunches === 5);
              assert(payload.data.totalPunches === 5);
              assert(payload.data.visitCount === 0);
              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    var consumerId = 9, businessId = 1;
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      tu.put('/v1/consumers/' + consumerId + '/loyalty/' + businessId, { deltaPunches:'asdf' }, function(err, payload, res) {
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });

  it('should allow business managers to make changes via tapin auth', function(done) {
    var consumerId = 9, businessId = 1;
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      tu.tapinAuthRequest('PUT', '/v1/consumers/' + consumerId + '/loyalty/' + businessId, '123456-XXX', { deltaPunches:5, locationId:1 }, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);
        tu.logout(function() {
          tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyalty/businesses/' + businessId, function(error, results, res) {
              assert(res.statusCode === 200);
              results = JSON.parse(results);
              assert(results.data.numPunches === 3);
              assert(results.data.totalPunches === 33);
              assert(results.data.numRewards === 2);

              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should allow business cashiers to make changes via tapin auth', function(done) {
    var consumerId = 9, businessId = 1;
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      tu.tapinAuthRequest('PUT', '/v1/consumers/' + consumerId + '/loyalty/' + businessId, '123456-XYX', { deltaPunches:5, locationId:1 }, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);
        tu.logout(function() {
          tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyalty/businesses/' + businessId, function(error, results, res) {
              assert(res.statusCode === 200);
              results = JSON.parse(results);
              assert(results.data.numPunches === 0);
              assert(results.data.totalPunches === 38);
              assert(results.data.numRewards === 4);

              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should not allow consumers to make changes via tapin auth', function(done) {
    var consumerId = 9, businessId = 1;
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      tu.tapinAuthRequest('PUT', '/v1/consumers/' + consumerId + '/loyalty/' + businessId, '123456-CO4', { deltaPunches:5, locationId:1 }, function(error, results, res) {
        assert(res.statusCode === 403);
        tu.logout(done);
      });
    });
  });
});