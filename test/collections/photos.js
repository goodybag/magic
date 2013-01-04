var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')

, baseUrl = config.baseUrl
;

describe('GET /v1/photos', function() {

  it('should respond with a photo listing', function(done) {
    tu.get('/v1/photos', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 0);
      assert(payload.data[0].id == 1);
      done();
    });
  });
});


describe('GET /v1/businesses/:id/photos', function() {

  it('should respond with a photo listing', function(done) {
    tu.get('/v1/businesses/1/photos', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length == 2);
      assert(payload.data[0].id == 1);
      done();
    });
  });

  it('should return empty with invalid businesses id', function(done){
    tu.get('/v1/businesses/100/photos', function(err, payload) {

      assert(!err);
      payload = JSON.parse(payload);
      assert(!payload.error);
      assert(payload.data.length == 0);
      done();
    });
  });
});


describe('GET /v1/photos/:id', function() {

  it('should respond with a photo', function(done) {
    tu.get('/v1/photos/1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id == 1);
      done();
    });
  });
});


describe('POST /v1/photos', function() {

  it('should respond with the id of a new photo', function(done) {
    tu.loginAsSales(function(error, user){
      utils.post(baseUrl + '/v1/photos', { businessId:2, url:'http://placekitten.com/400/300' }, function(err, res, payload) {
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
      utils.post(baseUrl + '/v1/photos', { businessId:'foobar' }, function(err, res, payload) {
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


describe('PATCH /v1/photos/:id', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      utils.patch(baseUrl + '/v1/photos/2', { businessId:2, name:'Barhouse2' }, function(err, res, payload) {
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
      utils.patch(baseUrl + '/v1/photos/2', { businessId:'foobar' }, function(err, res, payload) {

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


describe('DELETE /v1/photos/:id', function() {
  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      utils.del(baseUrl + '/v1/photos/2', function(err, res, payload) {
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