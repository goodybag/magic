var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');

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
    tu.post('/v1/users', user, function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id >= 0);
      done();
    });
  });

  it('should fail if user email existing', function(done){
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
    })
  });

  it('should fail if included group does not exist', function(done){
    var user = {
      email:'foobar'
    , password:'foobar'
    , groups:[10000]
    };

    tu.post('/v1/users', user, function(error, results, res){
      assert(!error);
      assert(res.statusCode === 400);
      results = JSON.parse(results);
      assert(results.error.name == 'INVALID_GROUPS');
      done();
    })
  });
});

describe('PATCH /v1/users/:id', function() {
  it('should update a user', function(done) {
    var user = {
      email: "new@email.com"
    , password: "whatever"
    , groups:[2, 3]
    };
    tu.patch('/v1/users/6', user, function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);

      tu.get('/v1/users/6', function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.email === 'new@email.com');
        assert(results.data.groups[0] === 2 && results.data.groups[1] === 3);
        done();
      });
    });
  });

  it('should not update user if email is taken', function(done){
    var user = {
      email: "sales@goodybag.com"
    };
    tu.patch('/v1/users/6', user, function(error, results, res){
      assert(!error);
      assert(res.statusCode === 400);
      results = JSON.parse(results);
      assert(results.error.name === 'EMAIL_REGISTERED');
      done();
    })
  });

  it('should respond 404 if the id is not in the database', function(done){
    var user = {
      email: "sales@goodybag.com"
    };
    tu.patch('/v1/users/500', user, function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should fail if included group does not exist', function(done){
    var user = {
      email: "foobar"
    , groups: [40000]
    };
    tu.patch('/v1/users/6', user, function(error, results, res){
      assert(!error);
      assert(res.statusCode === 400);
      results = JSON.parse(results);
      assert(results.error.name === 'INVALID_GROUPS');
      done();
    });
  });
});

describe('DEL /v1/users/:id', function() {
  it('should delete a single user', function(done) {
    tu.loginAsAdmin(function(error, user){
      var id = 6; // Dumb user not used for anything
      tu.del('/v1/users/' + id, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);
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