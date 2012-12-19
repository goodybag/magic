var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');

var utils = require('../../lib/utils');

var baseUrl = "http://localhost:8986";

describe('GET /v1/users', function() {
  it('should respond with a user listing', function(done) {
    tu.get('/v1/users', function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.length > 0);
      done();
    });
  });
});

describe('GET /v1/users/:id', function() {
  var id = 1;
  it('should respond with a user of id ' + id, function(done) {
    tu.get('/v1/users/' + id, function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id === id);
      done();
    });
  });
});

describe('POST /v1/users', function() {
  it('should create a user and respond with the id', function(done) {
    var user = {
      email: "testmctesterson@test.com"
    , password: "testetsetset"
    };
    tu.post('/v1/users', user, function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id >= 0);
      done();
    });
  });
});

describe('DEL /v1/users/:id', function() {
  it('should delete a single user document', function(done) {
    // First need to login
    var user = {
      email:    "admin@goodybag.com"
    , password: "password"
    };
    utils.post(baseUrl + '/v1/session', user, function(error, request, results){
      var id = 6; // Dumb user not used for anything

      // Make sure there were no login errors
      assert(!error);
      assert(!results.error);
      assert(results.data.id);

      utils.del(baseUrl + '/v1/users/' + id, function(error, request, results) {
        assert(!error);
        assert(!results.error);

        // Logout
        utils.del(baseUrl + '/v1/session', function(error){
          assert(!error);
          done();
        });
      });
    });
  });

  it('should fail to delete a single user document because of lack of permissions', function(done) {
    // First need to login
    var user = {
      email:    "sales@goodybag.com"
    , password: "password"
    };
    utils.post(baseUrl + '/v1/session', user, function(error, request, results){
      var id = 6; // Dumb user not used for anything

      // Make sure there were no login errors
      assert(!error);
      assert(!results.error);
      assert(results.data.id);

      utils.del(baseUrl + '/v1/users/' + id, function(error, request, results) {
        assert(!error);
        assert(results.error);
        assert(results.error.name === "NOT_ALLOWED");

        // Logout
        utils.del(baseUrl + '/v1/session', function(error){
          assert(!error);
          done();
        });
      });
    });
  });
});