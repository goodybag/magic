var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, config  = require('./../../config')

, baseUrl = config.baseUrl
;

describe('POST /v1/auth', function() {
  it('should authenticate a user and return the user object', function(done) {
    // First need to login
    var user = {
      email:    "admin@goodybag.com"
    , password: "password"
    };
    utils.post(baseUrl + '/v1/auth', user, function(error, request, results){
      // Make sure there were no login errors
      assert(!error);
      assert(!results.error);
      assert(results.data.id);
      assert(utils.isArray(results.data.groups));
      done();
    });
  });

  it('should fail to authenticate user because of an invalid email', function(done) {
    // First need to login
    var user = {
      email:    "admin@goodybag.net"
    , password: "password"
    };
    utils.post(baseUrl + '/v1/auth', user, function(error, request, results){
      // Make sure there were no login errors
      assert(!error);
      assert(results.error);
      assert(results.error.name === "INVALID_EMAIL");
      done();
    });
  });

  it('should fail to authenticate user because of an invalid password', function(done) {
    // First need to login
    var user = {
      email:    "admin@goodybag.com"
    , password: "asdfasdf"
    };
    utils.post(baseUrl + '/v1/auth', user, function(error, request, results){
      // Make sure there were no login errors
      assert(!error);
      assert(results.error);
      assert(results.error.name === "INVALID_PASSWORD");
      done();
    });
  });
});