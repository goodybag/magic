var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')

, baseUrl = config.baseUrl
;

describe('GET /v1/productTags', function() {

  it('should respond with a productTag listing', function(done) {
    tu.get('/v1/productTags', function(err, payload, res) {

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


describe('GET /v1/businesses/:id/tags', function() {

  it('should respond with a productTag listing', function(done) {
    tu.get('/v1/businesses/1/tags', function(err, payload, res) {

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


describe('GET /v1/productTags/:id', function() {

  it('should respond with a productTag', function(done) {
    tu.get('/v1/productTags/1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id == 1);
      done();
    });
  });

});


describe('POST /v1/productTags', function() {

  it('should respond with the id of a new productTag', function(done) {
    tu.loginAsSales(function(error, user){
      utils.post(baseUrl + '/v1/productTags', { businessId:1, productId:1, tag:'foobar' }, function(err, res, payload) {
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
      utils.post(baseUrl + '/v1/productTags', { businessId:'foobar' }, function(err, res, payload) {
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


describe('PATCH /v1/productTags/:id', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      utils.patch(baseUrl + '/v1/productTags/2', { businessId:2, name:'Barhouse2' }, function(err, res, payload) {
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
      utils.patch(baseUrl + '/v1/productTags/2', { businessId:'foobar' }, function(err, res, payload) {

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


describe('DELETE /v1/productTags/:id', function() {
  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      utils.del(baseUrl + '/v1/productTags/2', function(err, res, payload) {
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