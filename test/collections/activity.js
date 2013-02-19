var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');
var magic = require('../../lib/magic');

describe('Consumers Activity: ', function() {

  it('store an event when a consumer raises funds for charity', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      // Just like a product from a tablet and it will trigger a visit
      tu.tapinAuthRequest('POST', '/v1/products/2222/feelings', '778899-CBC', { isLiked:true }, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 204);
      });
      magic.once('debug.visitActivityLogged', function() {
        tu.get('/v1/activity', function(error, results) {
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);
          assert(results.data.length > 0);
          assert(results.data.filter(function(d){
            return d.type === "donation" && d.userId === 18;
          }).length === 1);

          tu.logout(done);
        });
      });
    });
  });
});

describe('Loyalty Activity', function(){

  it('store an event when a user becomes elite', function(done) {
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      tu.tapinAuthRequest('PUT', '/v1/consumers/' + 17 + '/loyalty/' + 1, '123456-XYX', {deltaPunches:5,locationId:1}, function(error, results, res) {
        assert(res.statusCode == 204);
        tu.logout(function() {
          tu.login({ email:'consumer6@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyalty', function(err, payload, res) {
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
                    return d.type === "becameElite" && d.userId === 17;
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

  it('store an event when a user earns a punch', function(done) {
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      tu.put('/v1/consumers/' + 17 + '/loyalty/' + 1, { deltaPunches:5, locationId:1 }, function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(function() {
          tu.login({ email:'consumer6@gmail.com', password:'password' }, function() {
            tu.get('/v1/loyalty', function(err, payload, res) {
              assert(res.statusCode == 200);
              payload = JSON.parse(payload);
              assert(!payload.error);

              // Give server time to propagate Activity
              setTimeout(function(){
                tu.get('/v1/activity', function(error, results) {
                  assert(!error);
                  results = JSON.parse(results);
                  assert(!results.error);
                  assert(results.data.length > 0);
                  assert(results.data.filter(function(d){
                    return d.type === "punch" && d.userId === 17;
                  }).length >= 1);

                  tu.logout(done);
                });
              }, 100);
            });
          });
        })
      });
    });
  });

  it('store an event when a user redeems a reward', function(done) {
    tu.login({ email:'manager_redeem1@gmail.com', password:'password' }, function() {
      tu.post('/v1/redemptions', { deltaPunches:2, userId:17, tapinStationId:11133 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 204);

        tu.logout(function() {
          tu.login({ email:'consumer6@gmail.com', password:'password' }, function() {

            tu.get('/v1/loyalty', function(err, payload, res) {
              assert(res.statusCode == 200);

              payload = JSON.parse(payload);

              assert(!payload.error);

              // Give server time to propagate Activity
              setTimeout(function(){
                tu.get('/v1/activity', function(error, results) {
                  assert(!error);
                  results = JSON.parse(results);
                  assert(!results.error);
                  assert(results.data.length > 0);
                  assert(results.data.filter(function(d){
                    return d.type === "redemption" && d.userId === 17;
                  }).length >= 1);

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

describe('Products Activity: ', function() {
  it('store an event when a user likes a product', function(done) {
    tu.login({email: 'consumer6@gmail.com', password: 'password' }, function(error, user){
      assert(!error);
      tu.post('/v1/products/2222/feelings', { isLiked:true }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 204);

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
                return d.type === "like" && d.data.productId == 2222 && d.userId === 17;
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
        assert(res.statusCode == 204);

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
                return d.type === "want" && d.data.productId == 2222 && d.userId === 17;
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
        assert(res.statusCode == 204);

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
                return d.type === "try" && d.data.productId == 2222 && d.userId === 17;
              }).length === 1);

              tu.logout(done);
            });
          }, 100);
        });
      });
    });
  });
});