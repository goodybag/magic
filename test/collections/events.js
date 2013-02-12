var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');

describe('Consumers Events: ', function() {
  it('store an event when a user registers', function(done) {
    var consumer = {
      email:      "testmctesterson8899@test.com"
    , password:   "password"
    , firstName:  "Test"
    , lastName:   "McTesterson"
    , screenName: "testies"
    , cardId:     "123456-ZZZ"
    };

    tu.post('/v1/consumers', consumer, function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.consumerId >= 0);
      var consumerId = results.data.consumerId;

      tu.loginAsAdmin(function(error){
        // Give server time to propagate events
        setTimeout(function(){
          tu.get('/v1/events?limit=100', function(error, results) {
            assert(!error);
            results = JSON.parse(results);
            assert(!results.error);
            assert(results.data.length > 0);

            assert(results.data.filter(function(d){
              return d.type === "consumers.registered" && d.data.consumerId == consumerId;
            }).length === 1);

            tu.logout(done);
          });
        }, 100);
      });
    });
  });
});

describe('Products Events: ', function() {
  it('store an event when a user likes a product', function(done) {
    tu.loginAsConsumer(function(error, user){
      assert(!error);
      tu.post('/v1/products/3/feelings', { isLiked:true }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 200);

        tu.get('/v1/products/3', function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);
          assert(payload.data.likes >= 1);

          tu.logout(function(){
            tu.loginAsAdmin(function(error){
              assert(!error);
              // Give server time to propagate events
              setTimeout(function(){
                tu.get('/v1/events?limit=100', function(error, results) {
                  assert(!error);
                  results = JSON.parse(results);
                  assert(!results.error);
                  assert(results.data.length > 0);
                  assert(results.data.filter(function(d){
                    // Also need to check the consumerId
                    return d.type === "products.like" && d.data.productId == 3 && d.data.userId == 5;
                  }).length === 1);

                  tu.logout(done);
                });
              }, 100);
            });
          });
        });
      });
    });
  });
});

describe('Loyalty Events: ', function() {
  it('store an event when a when a punch occurs', function(done) {
    var punch = { deltaPunches: 5, businessId: 1, consumerId: 9 };
    var stage = {
      start: function(){
        stage.loginAsTapInStation();
      }

    , loginAsTapInStation: function(){
        var user = { email:'tapin_station_0@goodybag.com', password:'password' };
        tu.login(user, function(error, user) {
          assert(!error);

          stage.updateLoyaltyStats();
        });
      }

    , updateLoyaltyStats: function(){
        tu.tapinAuthRequest('PUT', '/v1/consumers/' + punch.consumerId + '/loyalty/' + punch.businessId, '123456-XYX', punch, function(error, results, res) {
          assert(!error);
          assert(res.statusCode === 200);

          stage.loginAsAdmin();
        });
      }

    , loginAsAdmin: function(){
        tu.logout(function() {
          tu.loginAsAdmin(function(error){
            assert(!error);

            stage.ensureEventFired();
          });
        });
      }

    , ensureEventFired: function(){
        setTimeout(function(){
          tu.get('/v1/events?limit=100', function(error, results) {
            assert(!error);
            results = JSON.parse(results);
            assert(!results.error);
            assert(results.data.length > 0);
            assert(results.data.filter(function(d){
              // Also need to check the consumerId
              return (d.type === "loyalty.punch"
                && d.data.deltaPunches  == punch.deltaPunches
                && d.data.businessId    == punch.businessId
                && d.data.consumerId    == punch.consumerId
              );
            }).length >= 1);

            stage.end();
          });
        }, 100);
      }

    , end: function(){
        tu.logout(done);
      }
    };

    stage.start();
  });
});