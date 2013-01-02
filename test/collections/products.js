var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');

describe('GET /v1/products', function() {

  it('should respond with a product listing', function(done) {
    tu.get('/v1/products', function(err, payload, res) {
      
      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 1);
      assert(payload.data[0].id == 1);
      assert(payload.data[0].businessId == 1);
      assert(payload.data[0].name == 'Product 1');
      done();
    });
  });

});


describe('GET /v1/businesses/:id/products', function() {

  it('should respond with a product listing', function(done) {
    tu.get('/v1/businesses/1/products', function(err, payload, res) {
      
      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length == 1);
      assert(payload.data[0].id == 1);
      assert(payload.data[0].businessId == 1);
      assert(payload.data[0].name == 'Product 1');
      done();
    });
  });

});


describe('GET /v1/products/:id', function() {

  it('should respond with a product', function(done) {
    tu.get('/v1/products/1', function(err, payload, res) {
      
      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id == 1);
      assert(payload.data.businessId == 1);
      assert(payload.data.name == 'Product 1');
      done();
    });
  });

  it('should return null if product id is not in database', function(done){
    tu.get('/v1/products/100', function(err, payload, res) {
      assert(!err);
      payload = JSON.parse(payload);
      assert(!payload.error);
      assert(payload.data == null);
      done();
    });
  });

});


describe('POST /v1/products', function() {

  it('should respond with the id of a new product', function(done) {
    tu.post('/v1/products', JSON.stringify({ businessId:2, name:'asdf', price:12.34 }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id);
      done();
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.post('/v1/products', JSON.stringify({ businessId:'foobar' }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(payload.error);
      done();
    });
  });

});


describe('PATCH /v1/products/:id', function() {

  it('should respond with a 200', function(done) {
    tu.patch('/v1/products/2', JSON.stringify({ businessId:2, name:'fdsa' }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      done();
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.patch('/v1/products/2', JSON.stringify({ businessId:'foobar' }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(payload.error);
      done();
    });
  });

});


describe('DELETE /v1/products/:id', function() {

  it('should respond with a 200', function(done) {
    tu.del('/v1/products/2', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      done();
    });
  });

});


describe('GET /v1/products/:id/categories', function() {

  it('should respond with a category listing', function(done) {
    tu.get('/v1/products/1/categories', function(err, payload, res) {
      
      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 1);
      assert(payload.data[0].id == 1);
      assert(payload.data[0].name == 'Category 1');
      done();
    });
  });

});


describe('POST /v1/products/:id/categories', function() {

  it('should respond with an ok', function(done) {
    tu.post('/v1/products/1/categories', JSON.stringify({ id:3 }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      done();
    });
  });

  it('should not duplicate existing category relations', function(done) {
    tu.post('/v1/products/1/categories', JSON.stringify({ id:3 }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);

      tu.get('/v1/products/1/categories', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);

        assert(!payload.error);
        assert(payload.data.length === 3);
        done();
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.post('/v1/products/1/categories', JSON.stringify({ id:'foobar' }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(payload.error);
      done();
    });
  });

});

describe('DELETE /v1/products/:id/categories/:id', function() {

  it('should respond with a 200', function(done) {
    tu.del('/v1/products/1/categories/3', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      done();
    });
  });

});