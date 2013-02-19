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
      done();
    });
  });

  it('should paginate', function(done) {
    tu.get('/v1/product-tags?offset=1&limit=1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.meta.total > 1);
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
      assert(payload.data.length >= 1);
      assert(payload.data[0].tag);
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should paginate', function(done) {
    tu.get('/v1/businesses/1/product-tags?offset=1&limit=1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.meta.total > 1);
      done();
    });
  });

});


describe('POST /v1/businesses/:businessId/product-tags', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      tu.post('/v1/businesses/1/product-tags', { tag:'foobar' }, function(err, payload, res) {
        assert(!err);
        payload = JSON.parse(payload);
        assert(res.statusCode == 200);
        assert(!payload.error);
        tu.logout(done);
      });
    });
  });

  it('should not duplicate tags', function(done) {
    tu.loginAsSales(function(error, user){
      tu.get('/v1/businesses/1/product-tags', function(err, payload, res) {
        var count = JSON.parse(payload).meta.total;
        tu.post('/v1/businesses/1/product-tags', { tag:'foobar' }, function(err, payload, res) {
          assert(!err);
          payload = JSON.parse(payload);
          assert(res.statusCode == 200);
          assert(!payload.error);
          tu.get('/v1/businesses/1/product-tags', function(err, payload, res) {
            assert(count === JSON.parse(payload).meta.total);
            tu.logout(done);
          });
        });
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.loginAsSales(function(error, user){
      tu.post('/v1/businesses/1/product-tags', { tag:null }, function(err, payload, res) {
        payload = JSON.parse(payload);
        assert(!err);
        assert(res.statusCode == 400);

        assert(payload.error);
        tu.logout(done);
      });
    });
  });

});


describe('PATCH /v1/businesses/:businessId/product-tags/:tagId', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      tu.patch('/v1/businesses/1/product-tags/1', { tag:'clothes' }, function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.loginAsSales(function(error, user){
      tu.patch('/v1/businesses/1/product-tags/1', { tag: "" }, function(err, payload, res) {

        assert(!err);
        payload = JSON.parse(payload);
        assert(res.statusCode == 400);

        assert(payload.error);
        tu.logout(done);
      });
    });
  });

});


describe('DELETE /v1/businesses/:businessId/product-tags/:tagId', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      tu.del('/v1/businesses/1/product-tags/2', function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

});