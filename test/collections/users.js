var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');

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
      assert(payload.data.length === 1);
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
          assert(results.data.groups[0] === 1);
          assert(results.data.groups[1] === 2);

          tu.logout(done);
        });
      });
    });
  });

  it('should update users groups', function(done) {
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

        tu.get('/v1/users/'+results.data.id, function(error, results, res) {
          assert(!error);
          assert(res.statusCode == 200);

          results = JSON.parse(results);
          assert(results.data.groups[0] === 1);

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
      email:'foobar'
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

describe('PATCH /v1/users/:id', function() {
  it('should update a user', function(done) {
    var user = {
      email: "new@email.com"
    , password: "whatever"
    };
    tu.login({ email: 'dumb@goodybag.com', password: 'password' }, function(error){
      tu.patch('/v1/users/6', user, function(error, results, res) {
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

  it('should fail update a user because of invalid write permissions', function(done) {
    var user = {
      email: "blehdfasr@goodybag.com"
    , password: "whatever"
    , groups:[2, 3]
    };
    tu.login({ email: 'consumer@goodybag.com', password: 'password' }, function(error, authedUser){
      tu.patch('/v1/users/' + authedUser.id, user, function(error, results, res) {
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
      tu.patch('/v1/users/6', user, function(error, results, res) {
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
      tu.patch('/v1/users/6', user, function(error, results, res){
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
      tu.patch('/v1/users/500', user, function(error, results, res){
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
      email: "foobar"
    , groups: [40000]
    };
    tu.loginAsAdmin(function() {
      tu.patch('/v1/users/6', user, function(error, results, res){
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
      tu.patch('/v1/users/6', user, function(error, results, res){
        assert(!error);
        assert(res.statusCode === 204);

        tu.get('/v1/users/6', function(error, results, res){
          assert(!error);
          assert(res.statusCode === 200);
          assert(JSON.parse(results).data.groups.length !== 0);

          tu.logout(done);
        });
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
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.token);

        tu.post('/v1/users/password-reset/'+results.data.token, { password:'password2' }, function(error, results, res) {
          assert(res.statusCode == 204);

          tu.logout(function() {
            tu.login({ email: 'tferguson@gmail.com', password: 'password2' }, function(error){
              assert(!error);
              tu.logout(function() {

                tu.loginAsAdmin(function(error){
                  tu.patch('/v1/users/7', { password:'password' }, function(err, results, res) {
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

  it('should not return the token if session is not with admin', function(done) {
    tu.post('/v1/users/password-reset', { email:'tferguson@gmail.com' }, function(error, results, res) {
      assert(res.statusCode == 204);
      done();
    });
  });
});