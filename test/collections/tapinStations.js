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
  it('should filter by email', function(done) {
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
  it('should filter by business', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/tapin-stations?businessId=1', function(err, results, res) {
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
      tu.get('/v1/tapin-stations?locationId=1', function(err, results, res) {
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
      tu.get('/v1/tapin-stations/11130', function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.id == 11130);
        assert(typeof results.data.password == 'undefined');

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
      , numUnconfirmedPunchesAllowed: 2
      };

      tu.post('/v1/tapin-stations', tapinStation, function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.id >= 0);
        tu.get('/v1/tapin-stations/'+results.data.id, function(error, results, res) {
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.numUnconfirmedPunchesAllowed == 2);
          tu.logout(done);
        });
      });
    });
  });

  it('should use smart defaults', function(done) {
    tu.loginAsAdmin(function(error){
      assert(!error);

      var tapinStation = {
        email:      "tapinstation_with_defaults@goodybag.com"
      , password:   "password"
      , businessId: 1
      , locationId: 1
      };

      tu.post('/v1/tapin-stations', tapinStation, function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.id >= 0);
        tu.get('/v1/tapin-stations/'+results.data.id, function(error, results, res) {
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.numUnconfirmedPunchesAllowed === 0);
          tu.logout(done);
        });
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
      locationId: 4,
      numUnconfirmedPunchesAllowed: 3
    };
    tu.loginAsAdmin(function(error){
      tu.patch('/v1/tapin-stations/11130', tapinStation, function(error, results, res) {
        assert(res.statusCode == 204);

        tu.get('/v1/tapin-stations/11130', function(error, results) {
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);
          assert(results.data.locationId === 4);
          assert(results.data.numUnconfirmedPunchesAllowed === 3);
          tu.logout(function() {
            done();
          });
        });
      });
    });
  });

  it('should not update a tapinStation if permissions are absent', function(done) {
    var tapinStation = {
      loyaltyEnabled: true
    };
    tu.loginAsConsumer(function() {
      tu.patch('/v1/tapin-stations/11130', tapinStation, function(error, results, res) {
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

  it('should allow a blank location id', function(done) {
    var tapinStation = {
      locationId: ''
    };
    tu.loginAsAdmin(function() {
      tu.patch('/v1/tapin-stations/11130', tapinStation, function(error, results, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });
});

describe('DEL /v1/tapin-stations/:id', function() {
  var id = 11132; // Dumb tapinStation not used for anything
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

describe('GET /v1/tapin-stations/heartbeats', function() {
  it('lists heartbeats', function(done){
    tu.loginAsAdmin(function(){
      tu.get('/v1/tapin-stations/heartbeats', function(error, results, res){
        assert(!error);
        assert(res.statusCode == 200);

        results = JSON.parse(results);

        assert(
          results.data.filter(function(hb){
            return hb.businessId == 1 && hb.locationId == 1 && hb.userId == 11130;
          }).length > 0
        );

        assert(
          results.data.filter(function(hb){
            return hb.businessId == 39 && hb.locationId == 51 && hb.userId == 11135;
          }).length > 0
        );
        tu.logout(done);
      });
    });
  });

  it('lists heartbeats and filters by business', function(done){
    tu.loginAsAdmin(function(){
      tu.get('/v1/tapin-stations/heartbeats?businessId=1', function(error, results, res){
        assert(!error);
        assert(res.statusCode == 200);

        results = JSON.parse(results);

        assert(
          results.data.filter(function(hb){
            return hb.businessId == 1;
          }).length == results.data.length
        );
        tu.logout(done);
      });
    });
  });

  it('lists heartbeats and filters by location', function(done){
    tu.loginAsAdmin(function(){
      tu.get('/v1/tapin-stations/heartbeats?locationId=1', function(error, results, res){
        assert(!error);
        assert(res.statusCode == 200);

        results = JSON.parse(results);

        assert(
          results.data.filter(function(hb){
            return hb.locationId == 1;
          }).length == results.data.length
        );
        tu.logout(done);
      });
    });
  });

  it('should tell the client not authenticated', function(done) {
    tu.get('/v1/tapin-stations/heartbeats', function(err, results, res) {
      assert(res.statusCode == 401);
      done();
    });
  });

  it('should tell the client not allowed', function(done) {
    tu.loginAsConsumer(function(){
      tu.get('/v1/tapin-stations/heartbeats', function(err, results, res) {
        assert(res.statusCode == 403);
        done();
      });
    });
  });

  it('should respond with invalid query params', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/tapin-stations/heartbeats?poop=butt', function(err, results, res) {
        assert(res.statusCode == 400);
        results = JSON.parse(results);
        assert(results.error.name == 'VALIDATION_FAILED');
        done();
      });
    });
  });
});

describe('POST /v1/tapin-stations/:id/heartbeats', function() {

  it('creates a heartbeat', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      tu.post('/v1/tapin-stations/11130/heartbeats', { wifi: 8 }, function(err, results, res) {
        assert(res.statusCode == 204);
        tu.logout(function() {
          tu.loginAsAdmin(function() {
            tu.get('/v1/tapin-stations/11130/heartbeats', function(error, results, res) {
              assert(res.statusCode == 200);
              results = JSON.parse(results);
              assert(results.data.length > 0);
              assert(results.data.filter(function(d){
                return d.userId == 11130 && d.data.wifi == 8;
              }).length !== 0);
              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should tell the client not authenticated', function(done) {
    tu.post('/v1/tapin-stations/11130/heartbeats', { wifi: 8 }, function(err, results, res) {
      assert(res.statusCode == 401);
      done();
    });
  });

  it('should tell the client not allowed', function(done) {
    tu.loginAsConsumer(function(){
      tu.post('/v1/tapin-stations/11130/heartbeats', { wifi: 8 }, function(err, results, res) {
        assert(res.statusCode == 403);
        done();
      });
    });
  });
});

describe('GET /v1/session', function() {
  it('should authorize a consumer based on cardId by default', function(done) {
    tu.loginAsTablet(function() {
      tu.tapinAuthRequest('GET', '/v1/session', '123456-ABC', function(err, results, res) {
        assert(err == null);
        var payload;
        try {
          payload = JSON.parse(results);
        } catch(e) {
          assert(false, 'Could not parse response as json');
        }
        assert(payload != null);
        assert(payload.error == null);
        assert(payload.data != null);
        assert(payload.data.id === 7);
        done();
      });
    });
  });

  it('should authorize a consumer based on cardId with explicit header', function(done) {
    tu.loginAsTablet(function() {
      tu.httpRequest({
        method:'GET',
        path:'/v1/session',
        headers: {
          authorization: 'Tapin cardId 123456-ABC'
        }
      }, null, function(err, results, res) {
        assert(err == null);
        var payload;
        try {
          payload = JSON.parse(results);
        } catch(e) {
          assert(false, 'Could not parse response as json');
        }
        assert(payload != null);
        assert(payload.error == null);
        assert(payload.data != null);
        assert(payload.data.id === 7);
        done();
      });
    });
  });
});
