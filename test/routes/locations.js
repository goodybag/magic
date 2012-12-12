var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('./test-utils');

describe('GET /v1/locations', function() {

  it('should respond with a location listing', function(done) {
    tu.get('/v1/locations', function(err, payload, res) {
      
      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 1);
      assert(payload.data[0].id == 1);
      assert(payload.data[0].businessid == 1);
      assert(payload.data[0].name == 'Foohouse');
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
      assert(payload.data[0].businessid == 1);
      assert(payload.data[0].name == 'Foohouse');
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
      assert(payload.data.businessid == 1);
      assert(payload.data.name == 'Foohouse');
      done();
    });
  });

});


describe('POST /v1/locations', function() {

  it('should respond with the id of a new location', function(done) {
    tu.post('/v1/locations', JSON.stringify({ businessid:2, name:'asdf' }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id);
      done();
    });
  });

  it('should respond to an invalid payload with errors');

});


describe('PATCH /v1/locations/:id', function() {

  it('should respond with a 200', function(done) {
    tu.patch('/v1/locations/2', JSON.stringify({ businessid:2, name:'Barhouse2' }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      done();
    });
  });

  it('should respond to an invalid payload with errors');

});


describe('DELETE /v1/locations/:id', function() {

  it('should respond with a 200', function(done) {
    tu.del('/v1/locations/2', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      done();
    });
  });

});