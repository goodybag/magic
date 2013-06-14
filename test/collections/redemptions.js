var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
;

describe('POST /v1/redemptions', function() {

  it('should update the consumer stats and create a redemption', function(done) {
    tu.login({ email:'manager_redeem1@gmail.com', password:'password' }, function() {
      tu.post('/v1/redemptions', { deltaPunches:2, userId:11, tapinStationId:11133 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 204);

        tu.logout(function() {
          tu.login({ email:'consumer_redeem1@gmail.com', password:'password' }, function() {

            tu.get('/v1/consumers/11/loyalty/' + 1, function(err, payload, res) {
              assert(res.statusCode == 200);

              payload = JSON.parse(payload);
              assert(payload.data.numPunches === 4);
              assert(payload.data.totalPunches === 12);
              assert(payload.data.visitCount === 10);

              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should allow the redemptions from admin cashier at multiple locations', function(done) {
    tu.login({ email:'cashier_redeem_admin@gmail.com', password:'password' }, function() {
      tu.post('/v1/redemptions', { deltaPunches:200, userId:12, tapinStationId:11133 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 204);

        tu.post('/v1/redemptions', { deltaPunches:200, userId:12, tapinStationId:11135 }, function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 204);

          tu.logout(done);
        });
      });
    });
  });

  it('should not allow the redemption if the consumer is only partially registered', function(done) {
    tu.login({ email:'manager_redeem1@gmail.com', password:'password' }, function() {
      tu.post('/v1/redemptions', { deltaPunches:2, userId:20, tapinStationId:11133 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 412);
        payload = JSON.parse(payload);
        assert(payload.error);
        assert(payload.error.name = "NOT_REGISTERED");
        tu.logout(done);
      });
    });
  });

  it('should not allow a redemption or update punches if the consumer is short on punches', function(done) {
    tu.login({ email:'manager_redeem1@gmail.com', password:'password' }, function() {
      tu.post('/v1/redemptions', { deltaPunches:1, userId:11, tapinStationId:11133 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 403);

        tu.logout(function() {
          tu.login({ email:'consumer_redeem1@gmail.com', password:'password' }, function() {

            tu.get('/v1/consumers/11/loyalty/' + 1, function(err, payload, res) {
              assert(res.statusCode == 200);

              payload = JSON.parse(payload);
              assert(payload.data.numPunches === 4);
              assert(payload.data.totalPunches === 12);
              assert(payload.data.visitCount === 10);

              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should use the elite requirement if the consumer is elite', function(done) {
    tu.login({ email:'consumer_redeem2@gmail.com', password:'password' }, function(error, user) {
      var loyaltyUrl = '/v1/consumers/' + user.id + '/loyalty/1';
      tu.get(loyaltyUrl, function(err, payload, res) {
        assert(res.statusCode == 200);
        var orgStats = JSON.parse(payload).data;

        tu.logout(function() {
          tu.login({ email:'manager_redeem1@gmail.com', password:'password' }, function(err, user) {
            tu.post('/v1/redemptions', { deltaPunches:2, userId:12, tapinStationId:11133 }, function(err, payload, res) {
              assert(!err);

              assert(res.statusCode == 204);

              tu.logout(function() {
                tu.login({ email:'consumer_redeem2@gmail.com', password:'password' }, function() {

                  tu.get(loyaltyUrl, function(err, payload, res) {
                    assert(res.statusCode == 200);

                    payload = JSON.parse(payload);
                    assert(payload.data.numPunches === orgStats.numPunches + 2);
                    assert(payload.data.totalPunches === orgStats.totalPunches + 2);
                    assert(payload.data.visitCount === orgStats.visitCount);

                    tu.logout(done);
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.login({ email:'manager_redeem1@gmail.com', password:'password' }, function() {
      tu.post('/v1/redemptions', { deltaPunches:'asdf', userId:'asdf', tapinStationId:'asdf' }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });

  it('should allow cashiers of the business to authorize', function(done) {
    tu.login({ email:'consumer_redeem1@gmail.com', password:'password' }, function() {
      tu.get('/v1/loyalty', function(err, payload, res) {
        assert(res.statusCode == 200);
        var orgStats = JSON.parse(payload).data;
        tu.logout(function() {

          tu.login({ email:'cashier_redeem1@gmail.com', password:'password' }, function() {
            tu.post('/v1/redemptions', { deltaPunches:8, userId:11, tapinStationId:11133 }, function(err, payload, res) {
              assert(res.statusCode == 204);
              tu.logout(function() {

                tu.login({ email:'consumer_redeem1@gmail.com', password:'password' }, function() {
                  tu.get('/v1/loyalty', function(err, payload, res) {
                    assert(!err);
                    assert(res.statusCode == 200);

                    payload = JSON.parse(payload);
                    assert(!payload.error);
                    assert(payload.data[0].numPunches === orgStats[0].numPunches); // 8 = number required for reward, so it rolled over
                    assert(payload.data[0].totalPunches === orgStats[0].totalPunches + 8);
                    assert(payload.data[0].visitCount === orgStats[0].visitCount);
                    tu.logout(done);
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('should not allow cashiers of another business to authorize', function(done) {
    tu.login({ email:'cashier_redeem3@gmail.com', password:'password' }, function() {
      tu.post('/v1/redemptions', { deltaPunches:100, userId:11, tapinStationId:11133 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 403);
        tu.logout(done);
      });
    });
  });

  it('should not allow cashiers of another location to authorize', function(done) {
    tu.login({ email:'cashier_redeem2@gmail.com', password:'password' }, function() {
      tu.post('/v1/redemptions', { deltaPunches:100, userId:11, tapinStationId:11133 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 403);
        tu.logout(done);
      });
    });
  });

  it('should not allow managers of another business to authorize', function(done) {
    tu.login({ email:'manager_redeem3@gmail.com', password:'password' }, function() {
      tu.post('/v1/redemptions', { deltaPunches:100, userId:11, tapinStationId:11133 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 403);
        tu.logout(done);
      });
    });
  });

  it('should not allow managers of another location to authorize', function(done) {
    tu.login({ email:'manager_redeem2@gmail.com', password:'password' }, function() {
      tu.post('/v1/redemptions', { deltaPunches:100, userId:11, tapinStationId:11133 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 403);
        tu.logout(done);
      });
    });
  });

  it('should allow business owners to make changes via tapin auth', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      tu.tapinAuthRequest('POST', '/v1/redemptions', '123456-MA1', { deltaPunches:8, userId:11, tapinStationId:11133 }, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 204);
        tu.logout(done);
      });
    });
  });

});

describe('GET /v1/redemptions', function() {

  it('should respond with all redemptions', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/redemptions', function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 200);
        tu.logout(done);
      });
    });
  });

});
