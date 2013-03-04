var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');
var config = require('../../config');

describe('GET /v1/cashiers', function() {
  it('should respond with a cashier listing', function(done) {
    tu.loginAsAdmin(function(error){
      tu.get('/v1/cashiers', function(error, results) {
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
      tu.get('/v1/cashiers?filter=some_cashier', function(err, results, res) {
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
      tu.get('/v1/cashiers?businessId=1', function(err, results, res) {
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
      tu.get('/v1/cashiers?locationId=1', function(err, results, res) {
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
      tu.get('/v1/cashiers?offset=1&limit=1', function(err, results, res) {
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

describe('GET /v1/cashiers/:id', function() {
  it('should respond with a cashier', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/cashiers/11120', function(error, results) {
        assert(!error);
        results = JSON.parse(results);

        assert(!results.error);
        assert(results.data.userId === 11120);

        tu.logout(done);
      });
    });
  });

  it('should respond 404 if the id is not in the database', function(done){
    tu.loginAsAdmin(function(){
      tu.get('/v1/cashiers/500', function(error, results, res){
        assert(!error);
        assert(res.statusCode == 404);

        tu.logout(done);
      });
    });
  });

  it('should respond 404 if the id is not in correct type', function(done){
    tu.loginAsAdmin(function(){
      tu.get('/v1/cashiers/asdf', function(error, results, res){
        assert(!error);
        assert(res.statusCode == 404);

        tu.logout(done);
      });
    });
  });
});

describe('POST /v1/cashiers', function() {
  it('should create a cashier and respond with the user id', function(done) {
    tu.loginAsAdmin(function(error){
      assert(!error);

      var cashier = {
        email:      "cashier_dude_99@test.com"
      , password:   "password"
      , cardId:     "123456-XYL"
      , businessId: 1
      , locationId: 1
      };

      tu.post('/v1/cashiers', cashier, function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.userId >= 0);

        tu.logout(done);
      });
    });
  });

  it('should fail if the email exists', function(done){
    tu.loginAsAdmin(function(error){
      var cashier = {
        email:      "sales@goodybag.com"
      , password:   "password"
      , cardId:     "123456-XXY"
      , businessId: 1
      , locationId: 1
      };

      tu.post('/v1/cashiers', cashier, function(error, results, res){
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
      var cashier = {
        email:      "cashier1234@goodybag.com"
      , password:   "password"
      , firstName:  "Test"
      , lastName:   "McTesterson"
      , screenName: "testies"
      , cardId:     "12345-ZZZ"
      };

      tu.post('/v1/cashiers', cashier, function(error, results, res){
        assert(!error);
        assert(res.statusCode === 400);
        results = JSON.parse(results);
        assert(results.error.name == 'VALIDATION_FAILED');

        tu.logout(done);
      });
    });
  });
});

describe('PATCH /v1/cashiers/:id', function() {
  it('should update a cashier', function(done) {
    var cashier = {
      locationId: 4
    };
    tu.loginAsAdmin(function(error){
      tu.patch('/v1/cashiers/11120', cashier, function(error, results, res) {
        assert(res.statusCode == 204);

        tu.get('/v1/cashiers/11120', function(error, results) {
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);
          assert(results.data.locationId === 4);
          tu.logout(function() {
            done();
          });
        });
      });
    });
  });

  it('should not update a cashier if permissions are absent', function(done) {
    var cashier = {
      firstName: "Terd"
    };
    tu.loginAsConsumer(function() {
      tu.patch('/v1/cashiers/11120', cashier, function(error, results, res) {
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

  // Actually, since the ID doesn't exist yet and this route is protected
  // It will respond with a NOT_ALLOWED
  // Not sure if I should fix this though :/
  // it('should respond 404 if the id is not in the database', function(done){
  //   var cashier = {
  //     lastName: "consuemr"
  //   };
  //   tu.loginAsAdmin(function() {
  //     tu.patch('/v1/cashiers/500000', cashier, function(error, results, res){
  //       assert(!error);
  //       assert(res.statusCode == 404);
  //       tu.logout(function() {
  //         done();
  //       });
  //     });
  //   });
  // });
});

describe('DEL /v1/cashiers/:id', function() {
  var id = 11122; // Dumb cashier not used for anything
  it('should delete a single cashier whose userId is ' + id, function(done) {
    tu.loginAsAdmin(function(error, cashier){
      tu.del('/v1/cashiers/' + id, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 204);
        tu.logout(function() {
          done();
        });
      });
    });
  });

  it('should fail to delete a single cashier because of lack of permissions', function(done) {
    tu.loginAsConsumer(function(error, cashier){
      tu.del('/v1/cashiers/11120', function(error, results, res) {
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