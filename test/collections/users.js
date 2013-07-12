var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');
var magic = require('../../lib/magic');
var db = require('../../db');
var fbUsers = require('../fb-test-users.js');

describe('GET /v1/users', function() {
  it('should respond with a user listing', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/users', function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.length > 0);
        assert(results.data[0].groups);
        tu.logout(done);
      });
    })
  });

  it('should filter', function(done) {
    tu.get('/v1/users?filter=admin', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.length >= 1);
      done();
    });
  });
  it('should paginate', function(done) {
    tu.get('/v1/users?offset=1&limit=1', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.meta.total > 1);
      done();
    });
  });
});

describe('GET /v1/users/search', function() {
  it('should search by last name', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/users/search?lastName=Ferguson', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.length > 0);
        assert(payload.meta.total > 0);
        utils.each(payload.data, function(row) {
          assert(row.lastName === 'Ferguson');
        });
        done();
      });
    });
  });

  it('should search by first name', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/users/search?firstName=Turd', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.length > 0);
        assert(payload.meta.total > 0);
        utils.each(payload.data, function(row) {
          assert(row.firstName === 'Turd');
        });
        done();
      });
    });
  });

  it('should search by first and last name', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/users/search?firstName=Turd&lastName=Ferguson', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.length > 0);
        assert(payload.meta.total > 0);
        utils.each(payload.data, function(row) {
          assert(row.firstName === 'Turd');
          assert(row.lastName === 'Ferguson');
        });
        done();
      });
    });
  });

  it('should search ignoring letter case', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/users/search?lastName=fErGuSoN', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(payload.data.length > 0);
        assert(payload.meta.total > 0);
        utils.each(payload.data, function(row) {
          assert(row.lastName === 'Ferguson');
        });
        done();
      });
    });
  });

  it('should search ignoring letter case', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/users/search?lastName=fErGuSoN', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(payload.data.length > 0);
        assert(payload.meta.total > 0);
        utils.each(payload.data, function(row) {
          assert(row.lastName === 'Ferguson');
        });
        done();
      });
    });
  });
});

describe('GET /v1/users/:id', function() {
  it('should respond with a user', function(done) {
    tu.get('/v1/users/1', function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id === 1);
      done();
    });
  });

  it('should respond 404 if the id is not in the database', function(done){
    tu.get('/v1/users/500', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should respond 404 if the id is not in correct type', function(done){
    tu.get('/v1/users/asdf', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });
});

describe('POST /v1/users', function() {
  it('should create a user and respond with the id', function(done) {
    var user = {
      email: "testmctesterson@test.com"
    , password: "testetsetset"
    , groups:[1, 2]
    };

    tu.loginAsAdmin(function() {
      tu.post('/v1/users', user, function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.id >= 0);

        tu.get('/v1/users/'+results.data.id, function(error, results, res) {
          assert(!error);
          assert(res.statusCode == 200);

          results = JSON.parse(results);
          assert(results.data.groups[0].id === 1);
          assert(results.data.groups[1].id === 2);

          tu.logout(done);
        });
      });
    });
  });

  it('should create a user and update users groups', function(done) {
    tu.loginAsAdmin(function() {
      var user = {
        email: "testmctesterson2@test.com"
      , password: "testetsetset"
      , groups:[1, 2]
      };

      tu.post('/v1/users', user, function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.id >= 0);

        tu.get('/v1/users/' + results.data.id, function(error, results, res) {
          assert(!error);
          assert(res.statusCode == 200);

          results = JSON.parse(results);
          assert(results.data.groups[0].id === 1);

          tu.logout(done);
        });
      });
    });
  });

  it('should create a user and update users groups', function(done) {
    tu.loginAsAdmin(function() {
      var user = {
        email: "testmctesterson3@test.com"
      , password: "testetsetset"
      , groups:[{id: 1}, {id: 2}, {id: 4}]
      };

      tu.post('/v1/users', user, function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.id >= 0);

        tu.get('/v1/users/' + results.data.id, function(error, results, res) {
          assert(!error);
          assert(res.statusCode == 200);

          results = JSON.parse(results);
          assert(results.data.groups[0].id === 1);

          tu.logout(done);
        });
      });
    });
  });

  it('should fail if user email existing', function(done){
    tu.loginAsAdmin(function() {
      var user = {
        email: "sales@goodybag.com"
      , password: "password"
      };

      tu.post('/v1/users', user, function(error, results, res){
        assert(!error);
        assert(res.statusCode === 400);
        results = JSON.parse(results);
        assert(results.error.name == 'EMAIL_REGISTERED');
        done();
      });
    });
  });

  it('should fail if included group does not exist', function(done){
    var user = {
      email:'foobar@foobar.com'
    , password:'foobar'
    , groups:[10000]
    };

    tu.loginAsAdmin(function() {
      tu.post('/v1/users', user, function(error, results, res){
        assert(!error);
        assert(res.statusCode === 400);
        results = JSON.parse(results);
        assert(results.error.name == 'INVALID_GROUPS');
        tu.logout(function() {
          done();
        });
      });
    });
  });
});

describe('PUT /v1/users/:id', function() {
  it('should update a user', function(done) {
    var user = {
      email: "new@email.com"
    , password: "whatever"
    };
    tu.login({ email: 'dumb@goodybag.com', password: 'password' }, function(error){
      tu.put('/v1/users/6', user, function(error, results, res) {
        assert(res.statusCode == 204);

        tu.get('/v1/users/6', function(error, results) {
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);
          assert(results.data.email === 'new@email.com');
          tu.logout(done);
        });
      });
    });
  });

  it('should update users groups', function(done) {
    tu.loginAsAdmin(function() {
      var user = {
        email: "testmctesterson4@test.com"
      , password: "testetsetset"
      , groups:[1, 2]
      };

      tu.put('/v1/users/13', user, function(error, results, res) {
        assert(res.statusCode == 204)

        tu.get('/v1/users/13', function(error, results, res) {
          assert(!error);
          assert(res.statusCode == 200);

          results = JSON.parse(results);
          assert(results.data.groups[0].id === 1);

          tu.logout(done);
        });
      });
    });
  });

  it('should update users groups', function(done) {
    tu.loginAsAdmin(function() {
      var user = {
        email: "testmctesterson4@test.com"
      , password: "testetsetset"
      , groups:[{id: 1}, {id: 2}, {id: 4}]
      };

      tu.put('/v1/users/13', user, function(error, results, res) {
        assert(res.statusCode == 204)

        tu.get('/v1/users/13', function(error, results, res) {
          assert(!error);
          assert(res.statusCode == 200);

          results = JSON.parse(results);
          assert(results.data.groups[0].id === 1);

          tu.logout(done);
        });
      });
    });
  });

  it('should fail update a user because of invalid write permissions', function(done) {
    var user = {
      email: "blehdfasr@goodybag.com"
    , password: "whatever"
    , groups:[2, 3]
    };
    tu.login({ email: 'consumer@goodybag.com', password: 'password' }, function(error, authedUser){
      tu.put('/v1/users/' + authedUser.id, user, function(error, results, res) {
        assert(!error);
        results = JSON.parse(results);
        assert(results.error);
        assert(results.error.name === "INVALID_WRITE_PERMISSIONS");
        tu.logout(done);
      });
    });
  });

  it('should not update a user if permissions are absent', function(done) {
    var user = {
      email: "asdf@email.com"
    , password: "fdsa"
    , groups:[1]
    };
    tu.loginAsClient(function() {
      tu.put('/v1/users/6', user, function(error, results, res) {
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

  it('should not update user if email is taken', function(done){
    var user = {
      email: "sales@goodybag.com"
    };
    tu.loginAsAdmin(function() {
      tu.put('/v1/users/6', user, function(error, results, res){
        assert(!error);
        assert(res.statusCode === 400);
        results = JSON.parse(results);
        assert(results.error.name === 'EMAIL_REGISTERED');
        tu.logout(function() {
          done();
        });
      });
    });
  });

  it('should respond 404 if the id is not in the database', function(done){
    var user = {
      email: "sales@goodybag.com"
    };
    tu.loginAsAdmin(function() {
      tu.put('/v1/users/500', user, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 404);
        tu.logout(function() {
          done();
        });
      });
    });
  });

  it('should fail if included group does not exist', function(done){
    var user = {
      email: "foobar@foobar.com"
    , groups: [40000]
    };
    tu.loginAsAdmin(function() {
      tu.put('/v1/users/6', user, function(error, results, res){
        assert(!error);
        assert(res.statusCode === 400);
        results = JSON.parse(results);
        assert(results.error.name === 'INVALID_GROUPS');
        tu.logout(function() {
          done();
        });
      });
    });
  });

  it('should not destroy groups if no group value is provided', function(done){
    var user = {
      email: "foo@bar.com"
    };
    tu.loginAsAdmin(function() {
      tu.put('/v1/users/8', user, function(error, results, res){
        assert(!error);
        assert(res.statusCode === 204);

        tu.get('/v1/users/8', function(error, results, res){
          assert(!error);
          assert(res.statusCode === 200);
          assert(JSON.parse(results).data.groups.length !== 0);

          tu.logout(done);
        });
      });
    });
  });

  it('should create a partialRegistration record if there is email but no password or singlyId', function(done) {
    tu.loginAsTablet(function(){
      tu.tapinAuthRequest('GET', '/v1/session', '0000000-___', function(err, results, res) {
        // should have created a blank user
        assert(err == null);
        var payload = JSON.parse(results);
        assert(payload.error == null);
        assert(payload.meta != null);
        assert(payload.meta.isFirstTapin === true);
        assert(payload.meta.userId != null);
        var userId = payload.meta.userId;
        var data = {email:'test@example.com'};

        var event = 'user.partialRegistration';

        var callback = function(user, email, token){
          assert(email === data.email);
          assert(user.toString() === userId.toString());
          assert(token != null);
          magic.removeListener(event, callback);
          done();
        };

        magic.on(event, callback);

        tu.tapinAuthRequest('PUT', '/v1/users/' + userId, '0000000-___', data, function(err, result){});
      });
    });
  });
});

describe('DEL /v1/users/:id', function() {
  it('should delete a single user', function(done) {
    tu.loginAsAdmin(function(error, user){
      var id = 6; // Dumb user not used for anything
      tu.del('/v1/users/' + id, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 204);
        tu.logout(function() {
          done();
        });
      });
    });
  });

  it('should fail to delete a single user because of lack of permissions', function(done) {
    tu.loginAsClient(function(error, user){
      tu.del('/v1/users/1', function(error, results, res) {
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
});

describe('POST /v1/users/password-reset', function() {
  it('should allow the user to reset their password', function(done) {
    tu.loginAsAdmin(function(error){

      tu.post('/v1/users/password-reset', { email:'tferguson@gmail.com' }, function(error, results, res) {
        // you only get results if logged in as admin
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.token);
        var token = results.data.token;

        tu.post('/v1/users/password-reset/' + token, { password:'password2' }, function(error, results, res) {
          assert(res.statusCode == 204);

          tu.post('/v1/users/password-reset/' + token, { password:'password3' }, function(error, results, res) {
            assert(res.statusCode == 400);

            tu.logout(function() {
              tu.login({ email: 'tferguson@gmail.com', password: 'password2' }, function(error){
                assert(!error);
                tu.logout(function() {

                  tu.loginAsAdmin(function(error){
                    tu.put('/v1/users/7', { password:'password' }, function(err, results, res) {
                      assert(res.statusCode == 204);
                      tu.logout(done);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('should not return the token if session is not with admin', function(done) {
    tu.post('/v1/users/password-reset', { email:'tferguson@gmail.com' }, function(error, results, res) {
      assert(res.statusCode == 204);
      done();
    });
  });
});

describe('GET /v1/users/complete-registration/:token', function() {
  it('should return the email of a valid token', function(done) {
    tu.loginAsTablet(function(){
      tu.tapinAuthRequest('GET', '/v1/session', '0000001-___', function(err, results, res) {
        // should have created a blank user
        assert(err == null);
        var payload = JSON.parse(results);
        assert(payload.error == null);
        assert(payload.meta != null);
        assert(payload.meta.isFirstTapin === true);
        assert(payload.meta.userId != null);
        var userId = payload.meta.userId;
        var data = {email:'test_0000001@example.com'};

        var event = 'user.partialRegistration';

        var eventHandler = function(user, email, token){
          assert(token != null);
          tu.get('/v1/users/complete-registration/' + token, function(error, results) {
            assert(error == null);
            assert(results != null);
            var payload;
            try {
              payload = JSON.parse(results);
            } catch(e) {}
            assert(payload != null);
            assert(payload.error == null);
            assert(payload.data != null);
            assert(payload.data.email === email);
            magic.removeListener(event, eventHandler);
            tu.logout(done);
          });
        }

        magic.on(event, eventHandler);

        tu.tapinAuthRequest('PUT', '/v1/users/' + userId, '0000001-___', data, function(err, result){});
      });
    });
  });

  it('should return 404 for an invalid token', function(done) {
    tu.get('/v1/users/complete-registration/bad_token', function(error, results, res) {
      assert(res.statusCode === 404)
      done();
    });
  });
});

describe('POST /v1/users/complete-registration/:token', function() {
  it('should not accept a request with no password or singly credentials', function(done) {
    tu.post('/v1/users/complete-registration/any_token', {}, function(error, results, res) {
      assert(res.statusCode === 400)
      //TODO: parse real error
      done();
    });
  });

  it('should return 404 for an invalid token', function(done) {
    tu.post('/v1/users/complete-registration/bad_token', {password:'password'}, function(error, results, res) {
      assert(res.statusCode === 404)
      done();
    });
  });

  it('should complete a registration with a password', function(done) {
    tu.loginAsTablet(function(){
      tu.tapinAuthRequest('GET', '/v1/session', '0000002-___', function(err, results, res) {
        // should have created a blank user
        assert(err == null);
        var payload = JSON.parse(results);
        assert(payload.error == null);
        assert(payload.meta != null);
        assert(payload.meta.isFirstTapin === true);
        assert(payload.meta.userId != null);
        var userId = payload.meta.userId;
        var data = {email:'test_0000002@example.com'};

        var event = 'user.partialRegistration';

        var eventHandler = function(user, email, token){
          assert(token != null);
          tu.post('/v1/users/complete-registration/' + token, {password:'password'}, function(error, results, res) {
            assert(error == null);
            assert(res.statusCode === 200);

            var outstanding = 2;

            //check that the token has been used and cannot be used again
            tu.get('/v1/users/complete-registration/' + token, function(error, results, res) {
              assert(res.statusCode === 404);
              if(--outstanding <= 0) tu.logout(done);
            });

            tu.login({email:data.email, password:'password'}, function(error, result) {
              assert(error == null);
              assert(result != null);
              assert(result.email === data.email);
              if(--outstanding <= 0) tu.logout(done);
            });
          });

          magic.removeListener(event, eventHandler);
        }

        magic.on(event, eventHandler);

        tu.tapinAuthRequest('PUT', '/v1/users/' + userId, '0000002-___', data, function(err, result){});
      });
    });
  });

  it('should complete a registration with a password and screen name', function(done) {
    tu.loginAsTablet(function(){
      tu.tapinAuthRequest('GET', '/v1/session', '0000003-___', function(err, results, res) {
        // should have created a blank user
        assert(err == null);
        var payload = JSON.parse(results);
        assert(payload.error == null);
        assert(payload.meta != null);
        assert(payload.meta.isFirstTapin === true);
        assert(payload.meta.userId != null);
        var userId = payload.meta.userId;
        var data = {email:'test_0000003@example.com'};

        var event = 'user.partialRegistration';

        var eventHandler = function(user, email, token){
          assert(token != null);
          tu.post('/v1/users/complete-registration/' + token, {password:'password', screenName:'test'}, function(error, results, res) {
            assert(error == null);
            assert(res.statusCode === 200);

            var outstanding = 2;

            //check that the token has been used and cannot be used again
            tu.get('/v1/users/complete-registration/' + token, function(error, results, res) {
              assert(res.statusCode === 404);
              if(--outstanding <= 0) tu.logout(done);
            });

            tu.login({email:data.email, password:'password'}, function(error, result) {
              assert(error == null);
              assert(result != null);
              assert(result.email === data.email);
              tu.get('/v1/consumers/' + result.id, function(error, results) {
                assert(error == null);
                var payload;
                try {
                  payload = JSON.parse(results);
                } catch(e){}
                assert(payload != null);
                assert(payload.error == null);
                assert(payload.data != null);
                assert(payload.data.screenName === 'test');
                if(--outstanding <= 0) tu.logout(done);
              });
            });
          });

          magic.removeListener(event, eventHandler);
        }

        magic.on(event, eventHandler);

        tu.tapinAuthRequest('PUT', '/v1/users/' + userId, '0000003-___', data, function(err, result){});
      });
    });
  });

  it('should complete a registration with a password and email', function(done) {
    tu.loginAsTablet(function(){
      tu.tapinAuthRequest('GET', '/v1/session', '0000004-___', function(err, results, res) {
        // should have created a blank user
        assert(err == null);
        var payload = JSON.parse(results);
        assert(payload.error == null);
        assert(payload.meta != null);
        assert(payload.meta.isFirstTapin === true);
        assert(payload.meta.userId != null);
        var userId = payload.meta.userId;
        var data = {email:'test_0000004@example.com'};
        var newEmail = 'test_0000004_new@example.com';

        var event = 'user.partialRegistration';

        var eventHandler = function(user, email, token){
          assert(token != null);
          tu.post('/v1/users/complete-registration/' + token, {password:'password', email:newEmail}, function(error, results, res) {
            assert(error == null);
            assert(res.statusCode === 200);

            var outstanding = 2;

            //check that the token has been used and cannot be used again
            tu.get('/v1/users/complete-registration/' + token, function(error, results, res) {
              assert(res.statusCode === 404);
              if(--outstanding <= 0) tu.logout(done);
            });

            tu.login({email:newEmail, password:'password'}, function(error, result) {
              assert(error == null);
              assert(result != null);
              assert(result.email == newEmail);
              if(--outstanding <= 0) tu.logout(done);
            });
          });

          magic.removeListener(event, eventHandler);
        }

        magic.on(event, eventHandler);

        tu.tapinAuthRequest('PUT', '/v1/users/' + userId, '0000004-___', data, function(err, result){});
      });
    });
  });

/*
  it('should complete a registration with a singly code', function(done) {
    tu.loginAsTablet(function(){
      tu.tapinAuthRequest('GET', '/v1/session', '0000005-___', function(err, results, res) {
        // should have created a blank user
        assert(err == null);
        var payload = JSON.parse(results);
        assert(payload.error == null);
        assert(payload.meta != null);
        assert(payload.meta.isFirstTapin === true);
        assert(payload.meta.userId != null);
        var userId = payload.meta.userId;
        var data = {email:'test_0000005@example.com'};

        var event = 'user.partialRegistration';

        var eventHandler = function(user, email, token){
          assert(token != null);
          tu.post('/v1/users/complete-registration/' + token, {password:'password', code:''}, function(error, results, res) {
            assert(error == null);
            assert(res.statusCode === 200);

            var outstanding = 2;

            //check that the token has been used and cannot be used again
            tu.get('/v1/users/complete-registration/' + token, function(error, results, res) {
              assert(res.statusCode === 404);
              if(--outstanding <= 0) tu.logout(done);
            });

            //what do i do to test that the account has been created
            tu.login({email:newEmail, password:'password'}, function(error, result) {
              assert(error == null);
              assert(result != null);
              assert(result.email == newEmail);
              if(--outstanding <= 0) tu.logout(done);
            });
          });

          magic.removeListener(event, eventHandler);
        }

        magic.on(event, eventHandler);

        tu.tapinAuthRequest('PUT', '/v1/users/' + userId, '0000005-___', data, function(err, result){});
      });
    });
  });
*/
});

describe('GET /v1/users/card-updates/:token', function(){
  it('should return the users card update request', function(done){
    var token = 'a';

    tu.get('/v1/users/card-updates/' + token, function(error, payload, response){
      assert(!error)
      assert(response.statusCode == 200);

      try {
        payload = JSON.parse(payload);
      } catch(e) {
        assert(false, 'Unable to parse payload as json. it should be json.');
      }

      assert(payload.data.oldCardId == '918273-UTU');
      assert(payload.data.newCardId == '918273-UTA');

      done();
    });
  });

  it('should 404 on expired token', function(done){
    var token = 'b';

    tu.get('/v1/users/card-updates/' + token, function(error, payload, response){
      assert(!error)
      assert(response.statusCode == 404);

      done();
    });
  });

  it('should 404 on non-existent token', function(done){
    var token = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';

    tu.get('/v1/users/card-updates/' + token, function(error, payload, response){
      assert(!error)
      assert(response.statusCode == 404);

      done();
    });
  });
});

describe('DELETE /v1/users/card-updates/:token', function(){
  it('should cancel users card update request', function(done){
    var token = 'd';

    tu.del('/v1/users/card-updates/' + token, function(error, payload, response){
      assert(!error)
      assert(response.statusCode == 204);

      db.api.consumerCardUpdates.findOne({ token: token }, function(error, result){
        assert(!error);

        assert(new Date(result.expires) < new Date());

        done();
      });

    });
  });

  it('should 404 on expired token', function(done){
    var token = 'b';

    tu.del('/v1/users/card-updates/' + token, function(error, payload, response){
      assert(!error)
      assert(response.statusCode == 404);

      done();
    });
  });

  it('should 404 on non-existent token', function(done){
    var token = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';

    tu.del('/v1/users/card-updates/' + token, function(error, payload, response){
      assert(!error)
      assert(response.statusCode == 404);

      done();
    });
  });
});

describe('POST /v1/users/card-updates', function(){
  it('should create a card update request', function(done){
    tu.loginAsTablet(function(error, user){
      var body = { email: 'tferguson@gmail.com', cardId: '978812-RWE' };
      tu.post('/v1/users/card-updates', body, function(error, payload, response){
        assert(!error)
        assert(response.statusCode == 200);

        tu.logout(done);
      });
    })
  });
});

describe('POST /v1/users/card-updates/:token', function(){
  it('should redeem a card update request', function(done){
    var token = 'c';
    var userId = 28;

    tu.post('/v1/users/card-updates/' + token, {}, function(error, payload, response){
      assert(!error)
      assert(response.statusCode == 204);

      db.api.users.findOne(userId, function(error, user){
        assert(!error);

        assert(user.cardId == '918273-UTA');

        done();
      });
    });
  });

  it('should 404 on non-existent token', function(done){
    var token = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
    var userId = 28;

    tu.post('/v1/users/card-updates/' + token, {}, function(error, payload, response){
      assert(!error)
      assert(response.statusCode == 404);

      done();
    });
  });
});

describe('The consumer cardupdate flow', function(){

  it('should update a consumers cardId given that the consumer did not previously have a cardId', function(done){
    this.timeout(6000)

    var businessId  = 1;
    var locationId  = 1;

    // Sorry, being lazy and just fulfilling these variables later
    var regularPunchesRequired;
    var numPunchesToGive;

    var consumer = {
      email:      'ccc1@gmail.com'
    , firstName:  'Test'
    , lastName:   'Testling'
    , password:   'password'
    };

    var managerCardId = '123456-XXX';
    var cardId = '309146-UEW';

    utils.stage({

      'start':
      // First populate the consumer
      function(next){
        tu.populate('consumers', [consumer], function(error, ids){
          assert(!error);
          assert(ids.length > 0);

          consumer.id = ids[0];

          next('Get business loyalty settings');
        });
      }

    , 'Get business loyalty settings':
      function(next, finish){
        db.api.businessLoyaltySettings.findOne({ businessId: businessId }, function(error, result){
          if (error) return finish(error);

          regularPunchesRequired = result.regularPunchesRequired;

          // Give enough punches to give a reward
          numPunchesToGive = regularPunchesRequired + 1;

          next('Tapin with new card');
        });
      }

    , 'Tapin with new card':
      // Consumer does some action requiring a tapin with a new card
      // a new user should be created
      function(next, finish){
        tu.loginAsTablet(function(error, tablet){
          assert(!error);

          tu.tapinAuthRequest('GET', '/v1/session', cardId, function(error, results, res){
            assert(!error);
            results = JSON.parse(results);

            assert(results.meta.isFirstTapin);

            assert(results.meta.userId);

            consumer.generatedId = results.meta.userId;

            next('Reward with a punch', results.meta.userId);
          });
        });
      }

    , 'Reward with a punch':
      function(userId, next, finish){
        var url = '/v1/consumers/' + userId + '/loyalty/' + businessId;
        var data = { deltaPunches: numPunchesToGive, locationId: locationId };

        tu.tapinAuthRequest('PUT', url, managerCardId, data, function(error, results, res){
          assert(!error);
          assert(res.statusCode == 204);

          next('Ensure Punches Are Gooda', userId)
          next('Perform email update', userId);
        });
      }

    , 'Ensure Punches Are Gooda':
      function(userId, next, finish){
        db.api.userLoyaltyStats.findOne({ userId: userId, businessId: businessId }, function(error, stats){
          assert(!error);

          assert(stats.numPunches === (numPunchesToGive % regularPunchesRequired));
          assert(stats.totalPunches === numPunchesToGive);
          assert(stats.numRewards === parseInt(numPunchesToGive / regularPunchesRequired))
        });
      }

    , 'Perform email update':
      // Tablet recognizes it was a new user and wants to update the new users
      // record with the email they entered at the tablet
      // However, the email they put in already exists so put in a cardupdate
      function(userId, next, finish){
        var update = { email: consumer.email };
        tu.tapinAuthRequest('PUT', '/v1/consumers/' + userId, cardId, update, function(error, results, res){
          assert(!error);
          assert(res.statusCode == 400);
          results = JSON.parse(results);
          assert(results.error.name == 'EMAIL_REGISTERED');

          next('Submit cardupdate request');
        });
      }

    , 'Submit cardupdate request':
      // This would send an email to the consumer with the token
      function(next, finish){
        var body = { email: consumer.email, cardId: cardId };
        tu.post('/v1/users/card-updates', body, function(error, payload, response){
          assert(!error);
          assert(response.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data.token);

          tu.logout(function(){
            next('Consume token', payload.data.token);
          });
        });
      }

    , 'Consume token':
      // Ideally, the user would be going to our website with the token in the URL
      // The website would post to /users/card-updates/:token
      function(token, next, finish){
        tu.post('/v1/users/card-updates/' + token, {}, function(error, payload, response){
          assert(!error);
          assert(response.statusCode == 204);

          next('Make sure old user does not exist')
        });
      }

    , 'Make sure old user does not exist':
      function(next, finish){
        db.api.users.findOne(consumer.generatedId, function(error, generatedUser){
          assert(!error);
          assert(!generatedUser);

          next('Ensure users cardId has been updated')
        });
      }

    , 'Ensure users cardId has been updated':
      function(next, finish){
        db.api.users.findOne(consumer.id, function(error, user){
          assert(!error);

          assert(user);

          assert(user.cardId == cardId);

          next('Ensure users loyalty stats transferred')
        });
      }

    , 'Ensure users loyalty stats transferred':
      function(next, finish){
        db.api.userLoyaltyStats.findOne({ userId: consumer.id, businessId: businessId }, function(error, stats){
          assert(!error);

          assert(stats.numPunches === (numPunchesToGive % regularPunchesRequired));
          assert(stats.totalPunches === numPunchesToGive);
          assert(stats.numRewards === parseInt(numPunchesToGive / regularPunchesRequired))

          finish();
        });
      }
    })(function(){
      tu.logout(done);
    });
  });
});
