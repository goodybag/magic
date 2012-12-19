var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')

, baseUrl = config.baseUrl
;

describe('GET /v1/businesses', function() {
  it('should respond with a business listing', function(done) {
    utils.get(baseUrl + '/v1/businesses', function(err, res, payload) {
      assert(!err);
      assert(!payload.error);
      assert(payload.data.length > 0);
      done();
    });
  });
});

describe('GET /v1/businesses/:id', function() {
  it('should respond with a single business document', function(done) {
    var id = 1;
    utils.get(baseUrl + '/v1/businesses/' + id, function(err, res, payload) {
      assert(!err);
      assert(!payload.error);
      assert(payload.data.id === id);
      done();
    });
  });
});

describe('DEL /v1/businesses/:id', function() {
  it('should delete a single business document', function(done) {
    tu.loginAsAdmin(function(error, user){
      var id = 3;
      utils.del(baseUrl + '/v1/businesses/' + id, function(err, res, payload) {
        assert(!err);
        assert(!payload.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should fail to delete a single business document because not logged in', function(done) {
    var id = 3;
    utils.del(baseUrl + '/v1/businesses/' + id, function(err, res, payload) {
      assert(!err);
      assert(payload.error);
      assert(payload.error.name === "NOT_AUTHENTICATED");
      tu.logout(function(){
        done();
      });
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
    , street2: 'asdf'
    , city: "Austin"
    , state: "TX"
    , zip: 78756
    };

    tu.loginAsSales(function(error, user){
      utils.post(baseUrl + '/v1/businesses', business, function(error, request, results){
        assert(!error);
        assert(!results.error);
        assert(results.data.id);
        tu.logout(function(){
          done();
        });
      });
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

    tu.loginAsSales(function(error, user){
      utils.post(baseUrl + '/v1/businesses', business, function(error, request, results){
        assert(!error);
        assert(results.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });
});

describe('POST /v1/businesses/:id', function(){
  it('should update a business\'s name and url', function(done){
    var business = {
      name: "Poophead McGees"
    , url: "http://pmcgee.com"
    };

    tu.loginAsSales(function(error, user){
      utils.post(baseUrl + '/v1/businesses/' + 1, business, function(error, results){
        assert(!error);
        assert(!results.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should fail to update a business because of an invalid field', function(done){
    var business = {
      name: "Poophead McGees"
    , url: 123
    };
    tu.loginAsSales(function(error, user){
      utils.post(baseUrl + '/v1/businesses/' + 1, business, function(error, request, results){
        assert(!error);
        assert(results.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });
});

describe('PUT /v1/businesses/:id', function(){
  it('should update a business\'s name and url', function(done){
    var business = {
      name: "Poophead McGees"
    , url: "http://pmcgee.com"
    };

    tu.loginAsSales(function(error, user){
      utils.put(baseUrl + '/v1/businesses/' + 1, business, function(error, results){
        assert(!error);
        assert(!results.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should fail to update a business because of an invalid field', function(done){
    var business = {
      name: "Poophead McGees"
    , url: 123
    };
    tu.loginAsSales(function(error, user){
      utils.put(baseUrl + '/v1/businesses/' + 1, business, function(error, request, results){
        assert(!error);
        assert(results.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });
});