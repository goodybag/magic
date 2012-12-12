var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('./test-utils');

describe('GET /v1/businesses', function() {
  it('should respond with a business listing', function(done) {
    tu.get('/v1/businesses', function(err, payload, res) {
      assert(!err);
      payload = JSON.parse(payload);
      assert(!payload.error);
      assert(payload.data.length > 0);
      done();
    });
  });
});

describe('GET /v1/businesses/:id', function() {
  it('should respond with a single business document', function(done) {
    var id = 1;
    tu.get('/v1/businesses/' + id, function(err, payload, res) {
      assert(!err);
      payload = JSON.parse(payload);
      assert(!payload.error);
      assert(payload.data.id === id);
      done();
    });
  });
});

describe('POST /v1/businesses', function(){
  it('should save a business and return the id', function(done){
    var business = {
      name: "Ballers, Inc."
    , url: "http://ballersinc.com"
    , cardCode: "123456"
    , street1: "123 Sesame St"
    , city: "Austin"
    , state: "TX"
    , zip: 78756
    };

    tu.post('/v1/businesses', business, function(error, results){
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id);
      done();
    });
  });

  it('should fail to save a business because of a validation error', function(done){
    var business = {
      name: "Ballers, Inc."
    , url: 123
    , cardCode: "123456"
    , street1: "123 Sesame St"
    , city: "Austin"
    , state: "TX"
    , zip: 78756
    };

    tu.post('/v1/businesses', business, function(error, results){
      assert(!error);
      results = JSON.parse(results);
      assert(results.error);
      done();
    });
  });
});

describe('POST /v1/businesses/:id', function(){
  it('should update a business\'s name and url', function(done){
    var business = {
      name: "Poophead McGees"
    , url: "http://pmcgee.com"
    };

    tu.post('/v1/businesses/' + 1, business, function(error, results){
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      done();
    });
  });

  it('should fail to update a business because of an invalid field', function(done){
    var business = {
      name: "Poophead McGees"
    , url: 123
    };

    tu.post('/v1/businesses/' + 1, business, function(error, results){
      assert(!error);
      results = JSON.parse(results);
      assert(results.error);
      done();
    });
  });
});

describe('PUT /v1/businesses/:id', function(){
  it('should update a business\'s name and url', function(done){
    var business = {
      name: "Poophead McGees"
    , url: "http://pmcgee.com"
    };

    tu.put('/v1/businesses/' + 1, business, function(error, results){
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      done();
    });
  });

  it('should fail to update a business because of an invalid field', function(done){
    var business = {
      name: "Poophead McGees"
    , url: 123
    };

    tu.put('/v1/businesses/' + 1, business, function(error, results){
      assert(!error);
      results = JSON.parse(results);
      assert(results.error);
      done();
    });
  });
});