var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')

, baseUrl = config.baseUrl
;

describe('GET /v1/product-tags', function() {

  it('should respond with a productTag listing', function(done) {
    tu.get('/v1/product-tags', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 1);
      assert(payload.data[0].id == 1);
      done();
    });
  });

});


describe('GET /v1/businesses/:id/product-tags', function() {

  it('should respond with a productTag listing', function(done) {
    tu.get('/v1/businesses/1/product-tags', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length == 2);
      assert(payload.data[0].id == 1);
      done();
    });
  });

});


describe('GET /v1/product-tags/:id', function() {

  it('should respond with a productTag', function(done) {
    tu.get('/v1/product-tags/1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id == 1);
      done();
    });
  });

});


describe('POST /v1/product-tags', function() {

  it('should respond with the id of a new productTag', function(done) {
    tu.loginAsSales(function(error, user){
      utils.post(baseUrl + '/v1/product-tags', { businessId:1, productId:1, tag:'foobar' }, function(err, res, payload) {
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
      utils.post(baseUrl + '/v1/product-tags', { businessId:'foobar' }, function(err, res, payload) {
        assert(!err);
        assert(res.statusCode == 200);

        assert(payload.error);
        assert(payload.error.length > 0);
        tu.logout(function(){
          done();
        });
      });

    });
  });

});


describe('PATCH /v1/product-tags/:id', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      utils.patch(baseUrl + '/v1/product-tags/2', { businessId:2, name:'Barhouse2' }, function(err, res, payload) {
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
      utils.patch(baseUrl + '/v1/product-tags/2', { businessId:'foobar' }, function(err, res, payload) {

        assert(!err);
        assert(res.statusCode == 200);

        assert(payload.error);
        assert(payload.error.length === 1);
        assert(payload.error[0].property == 'businessId');
        assert(payload.error[0].attributeName == 'pattern');
        tu.logout(function(){
          done();
        });
      });
    });
  });

});


describe('DELETE /v1/product-tags/:id', function() {
  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      utils.del(baseUrl + '/v1/product-tags/2', function(err, res, payload) {
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