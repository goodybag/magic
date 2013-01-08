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

  it('should return empty with invalid businesses id', function(done){
    tu.get('/v1/businesses/100/products', function(err, payload) {

      assert(!err);
      payload = JSON.parse(payload);
      assert(!payload.error);
      assert(payload.data.length == 0);
      done();
    });
  })
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
      assert(payload.data.categories.length > 1);
      assert(payload.data.tags.length > 1);
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

  it('should create a product and respond with the id of the new product', function(done) {
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

  it('should fail to post new product because of invalid field', function (done){
    tu.post('/v1/products', JSON.stringify({ businessId:2, name:'asdf', price:"jirjwyi" }), 'application/json', function(err, payload, res) {
      assert(!err);
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.error);
      done();
    });
  });

  it('should create a product with categories and respond with the id of the new product', function(done) {
    tu.post('/v1/products', JSON.stringify({ businessId:1, name:'zzzzz', price:99.99, categories: [1, 2] }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id);
      done();
    });
  });

  it('should fail to create a product with categories because of invalid categories', function(done) {
    tu.post('/v1/products', JSON.stringify({ businessId:1, name:'zzzzz', price:99.99, categories: [9999, 99999] }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(payload.error);
      assert(payload.error.name === "INVALID_CATEGORY_IDS");
      done();
    });
  });

  it('should create a product with tags and respond with the id of the new product', function(done) {
    tu.post('/v1/products', JSON.stringify({ businessId:1, name:'zzzzz', price:99.99, tags: ["food", "apparel"] }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id);
      done();
    });
  });

  it('should fail to create a product with tags because of invalid tags', function(done) {
    tu.post('/v1/products', JSON.stringify({ businessId:1, name:'zzzzz', price:99.99, tags: ["asdfadsf", "asdfsad"] }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(payload.error);
      assert(payload.error.name === "INVALID_TAGS");
      done();
    });
  });

  it('should create a product with categories and tags and respond with the id of the new product', function(done) {
    tu.post('/v1/products', JSON.stringify({ businessId:1, name:'zzzzz', price:99.99, categories: [1, 2], tags: ["food", "apparel"] }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id);
      done();
    });
  });
});


describe('PATCH /v1/products/:id', function() {

  it('should respond with a 200', function(done) {
    tu.patch('/v1/products/2', JSON.stringify({ businessId:2, name:'fdsa' }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);

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

  it('should fail to update product because of invalid field', function (done){
    tu.post('/v1/products', JSON.stringify({ businessId:2, name:'asdf', price:"jirjwyi", description: "" }), 'application/json', function(err, payload, res) {
      assert(!err);
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.error);
      done();
    });
  });

  it('should update the products name and categories ', function(done) {
    tu.patch('/v1/products/1', JSON.stringify({ name:'weeeeeeeeeee', categories: [2] }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);
      assert(!payload.error);

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
      assert(payload.data.length >= 1);
      done();
    });
  });

  it('should respond empty result with invalid id', function(done) {
    tu.get('/v1/products/100/categories', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length == 0);
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
        assert(payload.data.length >= 1);
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