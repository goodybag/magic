var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('./test-utils');

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

});


describe('POST /v1/products', function() {

  it('should respond with the id of a new product', function(done) {
    tu.post('/v1/products', JSON.stringify({ businessId:2, name:'asdf' }), 'application/json', function(err, payload, res) {

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
      assert(payload.error.length > 0);
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
      assert(payload.error.length === 1);
      assert(payload.error[0].property == 'businessId');
      assert(payload.error[0].attributeName == 'pattern');
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