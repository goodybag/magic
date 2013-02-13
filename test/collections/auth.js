var
  assert      = require('better-assert')
, sinon       = require('sinon')
, utils       = require('./../../lib/utils')
, config      = require('./../../config')
, tu          = require('../../lib/test-utils')
, baseUrl     = config.baseUrl
, callbackUrl = config.singly.callbackUrl
, test        = require('../test')
, fbUsers     = require('../fb-test-users.js')
;

describe('POST /v1/session', function() {
  it('should authenticate a user and return the user object', function(done) {
    // First need to login
    var user = {
      email:    "admin@goodybag.com"
    , password: "password"
    };
    tu.post('/v1/session', user, function(error, results){
      // Make sure there were no login errors
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id);
      assert(utils.isArray(results.data.groups));
      tu.logout(done);
    });
  });

  it('should authenticate a user and return the user object', function(done) {
    // First need to login
    var user = {
      email:    "tferguson@gmail.com"
    , password: "password"
    };
    tu.post('/v1/session', user, function(error, results){
      // Make sure there were no login errors
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id);
      assert(utils.isArray(results.data.groups));
      assert(results.data.groupIds.consumer == 1);
      tu.logout(done);
    });
  });

  // it('should authenticate a user as a consumer and return the user object', function(done) {
  //   // First need to login
  //   var user = {
  //     email:    "consumer@goodybag.com"
  //   , password: "password"
  //   };
  //   utils.post(baseUrl + '/v1/session', user, function(error, request, results){
  //     // Make sure there were no login errors
  //     assert(!error);
  //     assert(!results.error);
  //     assert(results.data.id);
  //     assert(utils.isArray(results.data.groups));
  //     assert(results.data.groups.indexOf('consumer') > -1);
  //     tu.logout(function(){
  //       done();
  //     });
  //   });
  // });

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

describe('GET /v1/oauth', function() {
  var service1 = "facebook", callbackUri = config.baseUrl + ":" + config.http.port;
  it('should respond with the correct singly url for authenticating via ' + service1, function(done) {
    tu.get('/v1/oauth?service=' + service1 + '&redirect_uri=' + callbackUri, function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);

      var url = config.singly.apiBaseUrl
        + "/oauth/authenticate?client_id="
        + config.singly.clientId
        + "&redirect_uri="
        + encodeURIComponent(callbackUri)
        + "&profile=all"
        + "&account=false"
        + "&service="
        + service1
      ;

      assert(results.data.url === url);
      done();
    });
  });

  var service2 = "github";
  it('should respond with an invalid service error', function(done) {
    tu.get('/v1/oauth?service=' + service2 + '&redirect_uri=' + callbackUri, function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(results.error);
      assert(results.error.name === "INVALID_SERVICE");
      done();
    });
  });
});

describe('POST /v1/oauth', function(){
  it('should respond with a new user id', function(done){
    // Post to our oauth
    var user = {
      group: 'consumer'
    , singlyId: fbUsers[0].account
    , singlyAccessToken: fbUsers[0].access_token
    };

    tu.post('/v1/oauth', user, function(error, results){
      assert(!error);

      results = JSON.parse(results);
      if (results.error) console.log(results.error);
      assert(!results.error);
      assert(results.data.id > 0);
      assert(results.data.groupIds.consumer > 0);
      tu.logout(done);
    });
  });

  it('should fail to authenticate user because of an invalid group type', function(done){
    var user = {
      group: 'jibber-jabbers'
    , singlyId: "12lk3j"
    , singlyAccessToken: "laksjdf"
    };
    tu.post('/v1/oauth', user, function(error, results){
      assert(!error);

      results = JSON.parse(results);
      assert(results.error);
      assert(results.error.name === "INVALID_GROUP");
      done();
    });
  });
});