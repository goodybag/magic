var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');

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

});


describe('POST /v1/locations', function() {

  it('should respond with the id of a new location', function(done) {
    tu.post('/v1/locations', JSON.stringify({ businessId:2, name:'asdf', street1:'asdf', city:'asdf', state:'AS', zip:'12345', country:'asdf' }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id);
      done();
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.post('/v1/locations', JSON.stringify({ businessId:'foobar' }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(payload.error);
      assert(payload.error.length > 0);
      done();
    });
  });

});


describe('PATCH /v1/locations/:id', function() {

  it('should respond with a 200', function(done) {
    tu.patch('/v1/locations/2', JSON.stringify({ businessId:2, name:'Barhouse2' }), 'application/json', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      done();
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.patch('/v1/locations/2', JSON.stringify({ businessId:'foobar' }), 'application/json', function(err, payload, res) {

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


describe('DELETE /v1/locations/:id', function() {

  it('should respond with a 200', function(done) {
    tu.del('/v1/locations/2', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      done();
    });
  });

});