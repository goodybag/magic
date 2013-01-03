var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')

, baseUrl = config.baseUrl
;

describe('GET /v1/locations', function() {

  it('should respond with a location listing', function(done) {
    tu.get('/v1/locations', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 1);
      assert(payload.data[0].id == 1);
      assert(payload.data[0].businessId == 1);
      assert(payload.data[0].name == 'Location 1');
      done();
    });
  });

});


describe('GET /v1/businesses/:id/locations', function() {

  it('should respond with a location listing', function(done) {
    tu.get('/v1/businesses/1/locations', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length == 1);
      assert(payload.data[0].id == 1);
      assert(payload.data[0].businessId == 1);
      assert(payload.data[0].name == 'Location 1');
      done();
    });
  });

  it('should respond nothing with invalid business id', function(done) {
    utils.get(baseUrl + '/v1/businesses/100/locations', function(error, res, payload) {
      assert(!error);
      assert(payload.data.length == 0);
      done();
    });
  });

  it('should respond error of invalid business id type', function(done) {
    utils.get(baseUrl + '/v1/businesses/abcd/locations', function(error, res, payload) {
      assert(!error);
      assert(payload.error);
      done();
    });
  });
});


describe('GET /v1/locations/:id', function() {

  it('should respond with a location', function(done) {
    tu.get('/v1/locations/1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id == 1);
      assert(payload.data.businessId == 1);
      assert(payload.data.name == 'Location 1');
      done();
    });
  });

  it('should respond nothing with invalid location id', function(done) {
    utils.get(baseUrl + '/v1/locations/100', function(error, res, payload) {
      assert(!error);
      assert(payload.data === null);
      done();
    });
  });

  it('should respond error of invalid business id type', function(done) {
    utils.get(baseUrl + '/v1/locations/abcd', function(error, res, payload) {
      assert(!error);
      assert(payload.error != null);
      done();
    });
  });

});


describe('POST /v1/locations', function() {

  it('should respond with the id of a new location', function(done) {
    tu.loginAsSales(function(error, user){
      utils.post(baseUrl + '/v1/locations', { businessId:2, name:'asdf', street1:'asdf', city:'asdf', state:'AS', zip:'12345', country:'asdf' }, function(err, res, payload) {
        assert(!err);
        assert(res.statusCode == 200);

        assert(!payload.error);
        assert(payload.data.id);
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.loginAsSales(function(error, user){
      utils.post(baseUrl + '/v1/locations', { businessId:'foobar' }, function(err, res, payload) {
        assert(!err);
        assert(res.statusCode == 200);

        assert(payload.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should return error of validation', function(done){
    tu.loginAsClient(function(error, user){
      utils.post(baseUrl + '/v1/locations', { businessId:2, name:'', street1:'', city:'', state:'', zip:'', country:'' }, function(err, res, payload) {
        assert(!err);
        assert(res.statusCode == 200);
        assert(payload.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });
});


describe('PATCH /v1/locations/:id', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      utils.patch(baseUrl + '/v1/locations/2', { businessId:2, name:'Barhouse2' }, function(err, res, payload) {
        assert(!err);
        assert(res.statusCode == 200);
        assert(!payload.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.loginAsSales(function(error, user){
      utils.patch(baseUrl + '/v1/locations/2', { businessId:'foobar' }, function(err, res, payload) {

        assert(!err);
        assert(res.statusCode == 200);

        assert(payload.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should return error of validation', function(done){
    tu.loginAsClient(function(error, user){
      utils.post(baseUrl + '/v1/locations', { businessId:2, name:'rtwtrw', street1:'wtyt4', zip:"12345" }, function(err, res, payload) {
        assert(!err);
        assert(res.statusCode == 200);
        assert(payload.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });

});


describe('DELETE /v1/locations/:id', function() {
  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      utils.del(baseUrl + '/v1/locations/2', function(err, res, payload) {
        assert(!err);
        assert(res.statusCode == 200);
        assert(!payload.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });

});