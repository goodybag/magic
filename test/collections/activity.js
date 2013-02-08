var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');

describe('Consumers Events: ', function() {
  it('store an event when a user registers', function(done) {
    return done();

    var consumer = {
      email:      "testmctesterson7799@test.com"
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
      tu.logout(function(){
        tu.loginAsAdmin(function(error){
          // Give server time to propagate events
          setTimeout(function(){
            tu.get('/v1/activity', function(error, results) {
              assert(!error);
              results = JSON.parse(results);
              assert(!results.error);
              assert(results.data.length > 0);

              assert(results.data.filter(function(d){
                return d.type === "registration" && d.data.consumerId == consumerId;
              }).length === 1);

              tu.logout(done);
            });
          }, 100);
        });
      });
    });
  });
});

describe('Products Events: ', function() {
  it('store activity when a user likes a product', function(done) {
    return done();

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
                tu.get('/v1/events', function(error, results) {
                  assert(!error);
                  results = JSON.parse(results);
                  assert(!results.error);
                  assert(results.data.length > 0);
                  assert(results.data.filter(function(d){
                    // Also need to check the consumerId
                    return d.type === "products.like" && d.data.productId == 3;
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