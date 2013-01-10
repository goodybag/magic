var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, config  = require('./../../config')
, tu = require('../../lib/test-utils')
, baseUrl = config.baseUrl
, callbackUrl = config.singly.callbackUrl
, test = require('../test')
;

describe('POST /v1/session', function() {
  it('should authenticate a user and return the user object', function(done) {
    // First need to login
    var user = {
      email:    "admin@goodybag.com"
    , password: "password"
    };
    utils.post(baseUrl + '/v1/session', user, function(error, request, results){
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
    utils.post(baseUrl + '/v1/session', user, function(error, request, results){
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
    utils.post(baseUrl + '/v1/session', user, function(error, request, results){
      // Make sure there were no login errors
      assert(!error);
      assert(results.error);
      assert(results.error.name === "INVALID_PASSWORD");
      done();
    });
  });
});

describe('GET v1/oauth', function(){
  it('should return callback url', function(done){
    tu.get(baseUrl+'/v1/oauth?service=facebook', function(error, results){
      assert(!error);
      assert(!results.error);
      results = JSON.parse(results);
      assert(results.data.toString().indexOf("service=facebook") !== -1)
      done();
    });
  });
});

describe('GET v1/callback', function(){
  it('should returns error when no code', function(done){
    var url = callbackUrl + "?error=ohaidosautrahir90347";
    tu.get(url, function(error, results){
      assert(!error);
      results = JSON.parse(results);
      assert(results.error.name === "SINGLY_CALLBACK");
      done();
    })
  });

})



