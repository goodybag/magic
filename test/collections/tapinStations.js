var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');
var config = require('../../config');

describe('GET /v1/tapin-stations', function() {
  it('should respond with a tapinStation listing', function(done) {
    tu.loginAsAdmin(function(error){
      tu.get('/v1/tapin-stations', function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.length > 0);

        tu.logout(done);
      });
    });
  });
  it('should filter', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/tapin-stations?filter=tapin_station', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.length >= 1);

        tu.logout(done);
      });
    });
  });
  it('should paginate', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/tapin-stations?offset=1&limit=1', function(err, results, res) {
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

describe('GET /v1/tapin-stations/:id', function() {
  it('should respond with a tapinStation', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/tapin-stations/1', function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.tapinStationId === 1);

        tu.logout(done);
      });
    });
  });

  it('should respond 404 if the id is not in the database', function(done){
    tu.loginAsAdmin(function(){
      tu.get('/v1/tapin-stations/500', function(error, results, res){
        assert(!error);
        assert(res.statusCode == 404);

        tu.logout(done);
      });
    });
  });

  it('should respond 404 if the id is not in correct type', function(done){
    tu.loginAsAdmin(function(){
      tu.get('/v1/tapin-stations/asdf', function(error, results, res){
        assert(!error);
        assert(res.statusCode == 404);

        tu.logout(done);
      });
    });
  });
});

describe('POST /v1/tapin-stations', function() {
  it('should create a tapinStation and respond with the user id', function(done) {
    tu.loginAsAdmin(function(error){
      assert(!error);

      var tapinStation = {
        email:      "tapin_station_3@goodybag.com"
      , password:   "password"
      , businessId: 1
      , locationId: 1
      };

      tu.post('/v1/tapin-stations', tapinStation, function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.tapinStationId >= 0);

        tu.logout(done);
      });
    });
  });

  it('should fail if the email exists', function(done){
    tu.loginAsAdmin(function(error){
      var tapinStation = {
        email:      "sales@goodybag.com"
      , password:   "password"
      , businessId: 1
      , locationId: 1
      };

      tu.post('/v1/tapin-stations', tapinStation, function(error, results, res){
        assert(!error);
        assert(res.statusCode === 400);
        results = JSON.parse(results);
        assert(results.error.name == 'EMAIL_REGISTERED');

        tu.logout(done);
      });
    });
  });
});

describe('PATCH /v1/tapin-stations/:id', function() {
  it('should update a tapinStation', function(done) {
    var tapinStation = {
      locationId: 4
    };
    tu.loginAsAdmin(function(error){
      tu.patch('/v1/tapin-stations/1', tapinStation, function(error, results, res) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);

        tu.get('/v1/tapin-stations/1', function(error, results) {
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

  it('should not update a tapinStation if permissions are absent', function(done) {
    var tapinStation = {
      firstName: "Terd"
    };
    tu.loginAsConsumer(function() {
      tu.patch('/v1/tapin-stations/7', tapinStation, function(error, results, res) {
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

describe('DEL /v1/tapin-stations/:id', function() {
  var id = 3; // Dumb tapinStation not used for anything
  it('should delete a single tapinStation whose userId is ' + id, function(done) {
    tu.loginAsAdmin(function(error, tapinStation){
      tu.del('/v1/tapin-stations/' + id, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);
        tu.logout(function() {
          done();
        });
      });
    });
  });

  it('should fail to delete a single tapinStation because of lack of permissions', function(done) {
    tu.loginAsConsumer(function(error, tapinStation){
      tu.del('/v1/tapin-stations/1', function(error, results, res) {
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


describe('POST /v1/tapin-stations/:id/heartbeat', function() {

  it('creates a heartbeat event', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      tu.post('/v1/tapin-stations/1/heartbeat', {}, function(err, results, res) {
        assert(res.statusCode == 200);
        tu.logout(function() {
          // Give server time to handle the event
          setTimeout(function(){
            tu.loginAsAdmin(function() {
              tu.get('/v1/events?filter=tapinstations.heartbeat', function(error, results) {
                assert(res.statusCode == 200);
                results = JSON.parse(results);
                assert(results.data.length > 0);
                assert(results.data.filter(function(d){
                  return d.data.tapinStationId === '1';
                }).length !== 0);

                tu.logout(done);
              });
            });
          }, 100);
        });
      });
    });
  });
});