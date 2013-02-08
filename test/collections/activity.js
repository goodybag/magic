var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');

describe('Consumers Events: ', function() {

  it('store an event when a user registers', function(done) {
  return done(); // TODO
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
          tu.get('/v1/events', function(error, results) {
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
    tu.login({email: 'consumer6@gmail.com', password: 'password' }, function(error, user){
      assert(!error);
      tu.post('/v1/products/2222/feelings', { isLiked:true }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 200);

        tu.get('/v1/products/2222', function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);
          assert(payload.data.likes >= 1);

          // Give server time to propagate events
          setTimeout(function(){
            tu.get('/v1/activity', function(error, results) {
              assert(!error);
              results = JSON.parse(results);
              assert(!results.error);
              assert(results.data.length > 0);
              assert(results.data.filter(function(d){
                return d.type === "like" && d.data.productId == 2222 && d.consumerId === 11;
              }).length === 1);

              tu.logout(done);
            });
          }, 100);
        });
      });
    });
  });

  it('store an event when a user wants a product', function(done) {
    tu.login({email: 'consumer6@gmail.com', password: 'password' }, function(error, user){
      assert(!error);
      tu.post('/v1/products/2222/feelings', { isWanted:true }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 200);

        tu.get('/v1/products/2222', function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);
          assert(payload.data.wants >= 1);

          // Give server time to propagate events
          setTimeout(function(){
            tu.get('/v1/activity', function(error, results) {
              assert(!error);
              results = JSON.parse(results);
              assert(!results.error);
              assert(results.data.length > 0);
              assert(results.data.filter(function(d){
                return d.type === "want" && d.data.productId == 2222 && d.consumerId === 11;
              }).length === 1);

              tu.logout(done);
            });
          }, 100);
        });
      });
    });
  });

it('store an event when a user tries a product', function(done) {
    tu.login({email: 'consumer6@gmail.com', password: 'password' }, function(error, user){
      assert(!error);
      tu.post('/v1/products/2222/feelings', { isTried:true }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 200);

        tu.get('/v1/products/2222', function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);
          assert(payload.data.tries >= 1);

          // Give server time to propagate events
          setTimeout(function(){
            tu.get('/v1/activity', function(error, results) {
              assert(!error);
              results = JSON.parse(results);
              assert(!results.error);
              assert(results.data.length > 0);
              assert(results.data.filter(function(d){
                return d.type === "try" && d.data.productId == 2222 && d.consumerId === 11;
              }).length === 1);

              tu.logout(done);
            });
          }, 100);
        });
      });
    });
  });
});

describe('Loyalty Events: ', function() {
  it('store an event when a when a punch occurs', function(done) {
    return done();
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
        tu.tapinAuthRequest('POST', '/v1/loyaltyStats', '123456-XYX', punch, function(error, results, res) {
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
          tu.get('/v1/events', function(error, results) {
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