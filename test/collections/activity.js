var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');

describe('Consumers Activity: ', function() {

  it('store an event when a raises funds for charity', function(done) {
    return done(); // TODO
  });

});

describe('Loyalty Activity', function(){

  it('store an event when a user becomes elite', function(done) {
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      tu.post('/v1/loyaltyStats', { deltaPunches:5, consumerId:11, businessId:1, locationId:1 }, function(err, payload, res) {
        assert(res.statusCode == 200);
        tu.logout(function() {
          tu.login({ email:'consumer6@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyaltyStats', function(err, payload, res) {
              assert(res.statusCode == 200);
              payload = JSON.parse(payload);
              assert(!payload.error);

              assert(payload.data[0].isElite === true);

              // Give server time to propagate Activity
              setTimeout(function(){
                tu.get('/v1/activity', function(error, results) {
                  assert(!error);
                  results = JSON.parse(results);
                  assert(!results.error);
                  assert(results.data.length > 0);
                  assert(results.data.filter(function(d){
                    return d.type === "becameElite" && d.consumerId === 11;
                  }).length === 1);

                  tu.logout(done);
                });
              }, 100);
            });
          });
        })
      });
    });
  });

  it('store an event when a user earns a punch', function(done) {
    return done(); // TODO
  });

  it('store an event when a user redeems a reward', function(done) {
    return done(); // TODO
  });

});

describe('Products Activity: ', function() {
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