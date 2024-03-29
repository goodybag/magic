var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')

, baseUrl = config.baseUrl
;

describe('GET /v1/product-categories', function() {
  it('should respond with a productCategory listing', function(done) {
    tu.get('/v1/product-categories', function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.length > 0);
      assert(results.data[0].name);
      assert(results.meta.total > 1);
      done();
    });
  });
  it('should paginate', function(done) {
    tu.get('/v1/product-categories?offset=1&limit=1', function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.length === 1);
      assert(results.data[0].name);
      assert(results.meta.total > 1);
      done();
    });
  });
});

describe('GET /v1/product-categories/:id', function() {
  var id = 1;
  it('should respond with a productCategory of id ' + id, function(done) {
    tu.get('/v1/product-categories/' + id, function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id === id);
      done();
    });
  });
});

describe('POST /v1/product-categories', function() {
  it('should create a productCategory and respond with the id', function(done) {
    tu.loginAsSales(function(error, user){
      var category = {
        businessId: 1
      , order: 2
      , isFeatured: false
      , name: "Some Other Category"
      , description: "An amazing description of the category"
      };
      tu.post('/v1/product-categories', category, function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.id >= 0);
        tu.logout(done);
      });
    });
  });
});

describe('PATCH /v1/product-categories/:id', function() {
  it('should update a productCategory and respond with no error', function(done) {
    tu.loginAsSales(function(error, user){
      var category = {
        isFeatured: false
      , description: 'Just a category'
      };
      tu.patch('/v1/product-categories/1', category, function(error, results, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });
});

describe('PATCH /v1/product-categories/:id', function() {
  it('Should fail to update category because it does not exist', function(done) {
    tu.loginAsSales(function(error, user){
      var category = {
        id: 99999999999
      , isFeatured: false
      };
      tu.patch('/v1/product-categories/' + category.id, category, function(error, results, res) {
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });
});

describe('DEL /v1/product-categories/:id', function() {
  it('should delete a single user document', function(done) {
    tu.loginAsSales(function(error, user){
      var id = 4; // Dumb category not used for anything

      tu.del('/v1/product-categories/' + id, function(error, results, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

  it('should fail to delete a single category document because of lack of permissions', function(done) {
    tu.loginAsConsumer(function(error, user){
      var id = 6; // Dumb user not used for anything

      tu.del('/v1/product-categories/' + id, function(error, results, res) {
        assert(!error);
        assert(res.statusCode == 403);

        // Logout
        tu.logout(done);
      });
    });
  });
});