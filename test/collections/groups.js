var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');

describe('GET /v1/groups', function() {
  it('should respond with a group listing', function(done) {
    tu.get('/v1/groups', function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.length > 0);
      done();
    });
  });
});

describe('GET /v1/groups/:id', function() {
  it('should respond with a group', function(done) {
    tu.get('/v1/groups/1', function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id === 1);
      done();
    });
  });

  it('should respond 404 if the id is not in the database', function(done){
    tu.get('/v1/groups/500', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should respond 404 if the id is not in correct type', function(done){
    tu.get('/v1/groups/asdf', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });
});

describe('POST /v1/groups', function() {
  it('should create a group and respond with the id', function(done) {
    var group = {
      name:'foobar'
    , users:[1, 2]
    };
    tu.post('/v1/groups', group, function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id >= 0);
      done();
    });
  });

  it('should fail if included user does not exist', function(done){
    var group = {
      name:'foobar'
    , users:[10000]
    };

    tu.post('/v1/groups', group, function(error, results, res){
      assert(!error);
      assert(res.statusCode === 400);
      results = JSON.parse(results);
      assert(results.error.name == 'INVALID_USERS');
      done();
    })
  });
});

describe('PATCH /v1/group/:id', function() {
  it('should update a group', function(done) {
    var group = {
      name: "barfoo"
    , users:[2, 3]
    };
    tu.patch('/v1/groups/6', group, function(error, results, res) {
      assert(!error);
      assert(res.statusCode == 200);
      tu.get('/v1/groups/6', function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.name === 'barfoo');
        assert(results.data.users[0] === 2 && results.data.users[1] === 3);
        done();
      });
    });
  });

  it('should respond 404 if the id is not in the database', function(done){
    var group = {
      name: "foobar"
    };
    tu.patch('/v1/groups/500', group, function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should fail if included user does not exist', function(done){
    var group = {
      name: "foobar"
    , users: [40000]
    };
    tu.patch('/v1/groups/6', group, function(error, results, res){
      assert(!error);
      assert(res.statusCode === 400);
      results = JSON.parse(results);
      assert(results.error.name === 'INVALID_USERS');
      done();
    });
  });
});

describe('DEL /v1/groups/:id', function() {
  it('should delete a single group', function(done) {
    tu.loginAsAdmin(function(error, user){
      var id = 6; // Dumb group not used for anything
      tu.del('/v1/groups/' + id, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);
        tu.logout(function() {
          done();
        });
      });
    });
  });

  it('should fail to delete a single group because of lack of permissions', function(done) {
    tu.loginAsClient(function(error, user){
      tu.del('/v1/groups/1', function(error, results, res) {
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