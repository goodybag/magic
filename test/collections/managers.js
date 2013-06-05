var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');
var config = require('../../config');

describe('GET /v1/managers', function() {
  it('should respond with a manager listing', function(done) {
    tu.loginAsAdmin(function(error){
      tu.get('/v1/managers', function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.length > 0);

        tu.logout(done);
      });
    });
  });
  it('should filter by email', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/managers?filter=some_manager', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.length >= 1);

        tu.logout(done);
      });
    });
  });
  it('should filter by business', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/managers?businessId=1', function(err, results, res) {
        assert(res.statusCode == 200);
        var payload = JSON.parse(results);
        assert(payload.data.length >= 1);
        assert(tu.arrHasOnly(payload.data, 'businessId', 1));
        tu.logout(done);
      });
    });
  });
  it('should filter by location', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/managers?locationId=1', function(err, results, res) {
        assert(res.statusCode == 200);
        var payload = JSON.parse(results);
        assert(payload.data.length >= 1);
        assert(tu.arrHasOnly(payload.data, 'locationId', 1));
        tu.logout(done);
      });
    });
  });
  it('should paginate', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/managers?offset=1&limit=1', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.length === 1);
        assert(payload.meta.total > 1);

        tu.logout(done);
      });
    });
  });
});

describe('GET /v1/managers/:id', function() {
  it('should respond with a manager', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/managers/11110', function(error, results) {
        assert(!error);
        results = JSON.parse(results);

        assert(!results.error);
        assert(results.data.id === 11110);

        tu.logout(done);
      });
    });
  });


  it('should respond with 403 if not a manager', function(done) {
    tu.loginAsConsumer(function() {
      tu.get('/v1/managers/11110', function(error, results, res) {
        assert(!error, 'expected no error but got ' + JSON.stringify(error));
        assert(res.statusCode === 403);
        tu.logout(done);
      });
    });
  });

  it('should fetch manager record if owner of record', function(done) {
    var owner = { email: 'some_manager@gmail.com', password: 'password' };
    tu.login(owner, function() {
      tu.get('/v1/managers/11110', function(error, results, res) {
        assert(!error);
        assert(res.statusCode !== 403);
        assert(results);
        var data = JSON.parse(results).data;
        assert(data.id === 11110);
        assert(data.businessId === 1);
        assert(data.locationId === 1);
        tu.logout(done);
      });
    });
  });

  it('should respond with 403 if not owner manager', function(done) {
    var owner = { email: 'some_manager2@gmail.com', password: 'password' };
    tu.login(owner, function() {
      tu.get('/v1/managers/11110', function(error, results, res) {
        assert(!error, 'expected no error but got ' + JSON.stringify(error));
        assert(res.statusCode === 403);
        tu.logout(done);
      });
    });
  });


  it('should respond 404 if the id is not in the database', function(done){
    tu.loginAsAdmin(function(){
      tu.get('/v1/managers/500', function(error, results, res){
        assert(!error);
        assert(res.statusCode == 404);

        tu.logout(done);
      });
    });
  });

  it('should respond 404 if the id is not in correct type', function(done){
    tu.loginAsAdmin(function(){
      tu.get('/v1/managers/asdf', function(error, results, res){
        assert(!error);
        assert(res.statusCode == 404);

        tu.logout(done);
      });
    });
  });
});

describe('POST /v1/managers', function() {
  it('should create a manager and respond with the user id', function(done) {
    tu.loginAsAdmin(function(error){
      assert(!error);

      var manager = {
        email:      "manager_dude_99@test.com"
      , password:   "password"
      , cardId:     "123555-XXZ"
      , businessId: 1
      , locationId: 1
      };

      tu.post('/v1/managers', manager, function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.id >= 0);

        tu.logout(done);
      });
    });
  });

  it('should fail if the email exists', function(done){
    tu.loginAsAdmin(function(error){
      var manager = {
        email:      "sales@goodybag.com"
      , password:   "password"
      , cardId:     "123456-XXY"
      , businessId: 1
      , locationId: 1
      };

      tu.post('/v1/managers', manager, function(error, results, res){
        assert(!error);
        assert(res.statusCode === 400);
        results = JSON.parse(results);
        assert(results.error.name == 'EMAIL_REGISTERED');

        tu.logout(done);
      });
    });
  });

  it('should fail because of an invalid tapinID', function(done){
    tu.loginAsAdmin(function(error){
      var manager = {
        email:      "manager1234@goodybag.com"
      , password:   "password"
      , firstName:  "Test"
      , lastName:   "McTesterson"
      , screenName: "testies"
      , cardId:     "12345-ZZZ"
      };

      tu.post('/v1/managers', manager, function(error, results, res){
        assert(!error);
        assert(res.statusCode === 400);
        results = JSON.parse(results);
        assert(results.error.name == 'VALIDATION_FAILED');

        tu.logout(done);
      });
    });
  });
});

describe('PATCH /v1/managers/:id', function() {
  it('should update a manager', function(done) {
    var manager = {
      locationId: 4
    };
    tu.loginAsAdmin(function(error){
      tu.patch('/v1/managers/11110', manager, function(error, results, res) {
        assert(res.statusCode == 204);

        tu.get('/v1/managers/11110', function(error, results) {
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);
          assert(results.data.locationId === 4);
          tu.logout(done);
        });
      });
    });
  });

  it('should accept a null locationId', function(done) {
    var manager = {
      locationId: null
    };
    tu.loginAsAdmin(function(error){
      tu.patch('/v1/managers/11110', manager, function(error, results, res) {
        assert(res.statusCode == 204);

        tu.get('/v1/managers/11110', function(error, results) {
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);
          assert(results.data.locationId === null);
          tu.logout(done);
        });
      });
    });
  });

  it('should not update a manager if permissions are absent', function(done) {
    var manager = {
      firstName: "Terd"
    };
    tu.loginAsConsumer(function() {
      tu.patch('/v1/managers/11110', manager, function(error, results, res) {
        assert(!error);
        assert(res.statusCode == 403);
        results = JSON.parse(results);
        assert(results.error);
        assert(results.error.name === "NOT_ALLOWED");
        tu.logout(done);
      });
    });
  });

  // Actually, since the ID doesn't exist yet and this route is protected
  // It will respond with a NOT_ALLOWED
  // Not sure if I should fix this though :/
  // it('should respond 404 if the id is not in the database', function(done){
  //   var manager = {
  //     lastName: "consuemr"
  //   };
  //   tu.loginAsAdmin(function() {
  //     tu.patch('/v1/managers/500000', manager, function(error, results, res){
  //       assert(!error);
  //       assert(res.statusCode == 404);
  //       tu.logout(function() {
  //         done();
  //       });
  //     });
  //   });
  // });
});

describe('DEL /v1/managers/:id', function() {
  var id = 11112; // Dumb manager not used for anything
  it('should delete a single manager whose userId is ' + id, function(done) {
    tu.loginAsAdmin(function(error, manager){
      tu.del('/v1/managers/' + id, function(error, results, res) {
        assert(res.statusCode === 204);
        tu.logout(function() {
          done();
        });
      });
    });
  });

  it('should fail to delete a single manager because of lack of permissions', function(done) {
    tu.loginAsConsumer(function(error, manager){
      tu.del('/v1/managers/1', function(error, results, res) {
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
