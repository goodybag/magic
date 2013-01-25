var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');
var config = require('../../config');

describe('GET /v1/consumers', function() {
  it('should respond with a consumer listing', function(done) {
    tu.get('/v1/consumers', function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.length > 0);
      done();
    });
  });
  it('should filter', function(done) {
    tu.get('/v1/consumers?filter=tferguson', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.length === 1);
      done();
    });
  });
  it('should paginate', function(done) {
    tu.get('/v1/consumers?offset=1&limit=1', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.meta.total > 1);
      done();
    });
  });
});

describe('GET /v1/consumers/:id', function() {
  it('should respond with a consumer', function(done) {
    tu.get('/v1/consumers/1', function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.consumerId === 1);
      done();
    });
  });

  it('should respond 404 if the id is not in the database', function(done){
    tu.get('/v1/consumers/500', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should respond 404 if the id is not in correct type', function(done){
    tu.get('/v1/consumers/asdf', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });
});

describe('POST /v1/consumers', function() {
  it('should create a consumer and respond with the user id', function(done) {
    var consumer = {
      email:      "testmctesterson99@test.com"
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
      assert(results.data.id >= 0);
      done();
    });
  });

  it('should fail if consumer email existing', function(done){
    var consumer = {
      email:      "sales@goodybag.com"
    , password:   "password"
    , firstName:  "Test"
    , lastName:   "McTesterson"
    , screenName: "testies"
    , cardId:     "123456-ZZZ"
    };

    tu.post('/v1/consumers', consumer, function(error, results, res){
      assert(!error);
      assert(res.statusCode === 400);
      results = JSON.parse(results);
      assert(results.error.name == 'EMAIL_REGISTERED');
      done();
    })
  });

  it('should fail because of an invalid cardId', function(done){
    var consumer = {
      email:      "consumer1234@goodybag.com"
    , password:   "password"
    , firstName:  "Test"
    , lastName:   "McTesterson"
    , screenName: "testies"
    , cardId:     "12345-ZZZ"
    };

    tu.post('/v1/consumers', consumer, function(error, results, res){
      assert(!error);
      assert(res.statusCode === 400);
      results = JSON.parse(results);
      assert(results.error.name == 'VALIDATION_FAILED');
      done();
    })
  });
});

describe('PATCH /v1/consumers/:id', function() {
  it('should update a consumer', function(done) {
    var consumer = {
      firstName: "Terd"
    };
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.patch('/v1/consumers/1', consumer, function(error, results, res) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);

        tu.get('/v1/consumers/1', function(error, results) {
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);
          assert(results.data.firstName === "Terd");
          tu.logout(done);
        });
      });
    });
  });

  it('should not update a consumer if permissions are absent', function(done) {
    var consumer = {
      firstName: "Terd"
    };
    tu.loginAsClient(function() {
      tu.patch('/v1/consumers/1', consumer, function(error, results, res) {
        assert(!error);
        assert(res.statusCode == 403);
        results = JSON.parse(results);
        assert(results.error);
        assert(results.error.name === "NOT_ALLOWED");
        tu.logout(function() {
          done();
        });
      });
    });
  });

  it('should respond 404 if the id is not in the database', function(done){
    var consumer = {
      lastName: "consuemr"
    };
    tu.loginAsAdmin(function() {
      tu.patch('/v1/consumers/500000', consumer, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 404);
        tu.logout(function() {
          done();
        });
      });
    });
  });

  // Skip this for now
  // it('should update a consumers email and password when they registered with facebook', function(done) {
  //   this.timeout(30000);
  //   tu.createTestOauthUser(function(error, results){
  //     if (error) console.log(error);
  //     assert(!error);

  //     // Post to our oauth
  //     var user = {
  //       group: 'consumer'
  //     , singlyId: results.account
  //     , singlyAccessToken: results.access_token
  //     };

  //     var update = {
  //       email: "testsstsststst@test.com"
  //     , password: "password"
  //     };

  //     tu.post('/v1/oauth', user, function(error, results){
  //       if (error) console.log(error);
  //       assert(!error);

  //       results = JSON.parse(results);
  //       if (results.error) console.log(results.error);
  //       assert(!results.error);
  //       assert(results.data.id > 0);

  //       var userId = results.data.id;

  //       tu.patch('/v1/consumers/' + userId , user, function(error, results, res) {
  //         if (error) console.log(error);
  //         assert(!error);
  //         results = JSON.parse(results);
  //         if (results.error) console.log(results.error);
  //         assert(!results.error);

  //         tu.logout(function(){
  //           tu.login(update, function(error, results){
  //             if (error) console.log(error);
  //             assert(!error);
  //             assert(results.id === userId);
  //             tu.logout(function(){
  //               done();
  //             });
  //           });
  //         });
  //       });
  //     });
  //   });
  // });
});

describe('DEL /v1/consumers/:id', function() {
  var id = 7; // Dumb consumer not used for anything
  it('should delete a single consumer whose userId is ' + id, function(done) {
    tu.loginAsAdmin(function(error, consumer){
      tu.del('/v1/consumers/' + id, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);
        tu.logout(done);
      });
    });
  });

  it('should fail to delete a single consumer because of lack of permissions', function(done) {
    tu.loginAsClient(function(error, consumer){
      tu.del('/v1/consumers/1', function(error, results, res) {
        assert(!error);
        assert(res.statusCode == 403);
        results = JSON.parse(results);
        assert(results.error);
        assert(results.error.name === "NOT_ALLOWED");
        tu.logout(done);
      });
    });
  });

  it('should perform a flash login and delete the user', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user){
      tu.tapinAuthRequest('DELETE', '/v1/consumers/8', '123456-YYZ', function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);

        tu.get('/v1/consumers/8', function(error, result, res){
          assert(!error);
          assert(res.statusCode === 404);

          tu.logout(done);
        });
      });
    });
  });
});