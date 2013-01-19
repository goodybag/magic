var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')

, baseUrl = config.baseUrl
;

describe('GET /v1/productCategories', function() {
  it('should respond with a productCategory listing', function(done) {
    tu.get('/v1/productCategories', function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.length > 0);
      // Check to make sure the correct fields exist
      // It'll be interesting when we get our READ/WRITE
      // field digestion finished because then we can check
      // the existence of all of our fields returned based on
      // logged in user
      assert(results.data[0].name);
      assert(results.meta.total > 1);
      done();
    });
  });
  it('should paginate', function(done) {
    tu.get('/v1/productCategories?offset=1&limit=1', function(error, results) {
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

describe('GET /v1/productCategories/:id', function() {
  var id = 1;
  it('should respond with a productCategory of id ' + id, function(done) {
    tu.get('/v1/productCategories/' + id, function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id === id);
      done();
    });
  });
});

describe('POST /v1/productCategories', function() {
  it('should create a productCategory and respond with the id', function(done) {
    tu.loginAsSales(function(error, user){
      var category = {
        businessId: 1
      , order: 2
      , isFeatured: false
      , name: "Some Other Category"
      };
      tu.post('/v1/productCategories', category, function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.id >= 0);
        tu.logout(function(){
          done();
        });
      });
    });
  });
});

describe('PATCH /v1/productCategories/:id', function() {
  it('should update a productCategory and respond with no error', function(done) {
    tu.loginAsSales(function(error, user){
      var category = {
        id: 1
      , isFeatured: false
      };
      tu.patch('/v1/productCategories/' + category.id, category, function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });
});

describe('PATCH /v1/productCategories/:id', function() {
  it('Should fail to update category because it does not exist', function(done) {
    tu.loginAsSales(function(error, user){
      var category = {
        id: 99999999999
      , isFeatured: false
      };
      tu.patch(baseUrl + '/v1/productCategories/' + category.id, category, function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(results.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });
});

describe('DEL /v1/productCategories/:id', function() {
  it('should delete a single user document', function(done) {
    tu.loginAsSales(function(error, user){
      var id = 4; // Dumb category not used for anything

      tu.del('/v1/productCategories/' + id, function(error, results) {
        assert(!error);
        results = JSON.parse(results);

        assert(!results.error);

        // Logout
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should fail to delete a single category document because of lack of permissions', function(done) {
    tu.loginAsConsumer(function(error, user){
      var id = 6; // Dumb user not used for anything

      tu.del('/v1/productCategories/' + id, function(error, results, res) {
        assert(!error);
        assert(res.statusCode == 403);

        // Logout
        tu.logout(function(){
          done();
        });
      });
    });
  });
});