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
      assert(payload.data[0].id);
      assert(payload.data[0].businessId);
      assert(typeof payload.data[0].businessIsGB != 'undefined');
      assert(payload.data[0].name);
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should respond with a product listing that does not include products from unverified businesses', function(done) {
    var data = [{ name: 'blakjsdkljfasjdf', isVerified: false }]
    tu.populate('businesses', data, function(err, ids) {

      assert(!err);
      var data = [{ name: 'something', businessId: ids[0] }];
      tu.populate('products', data, function(err, ids){

        assert(!err);
        var pid = ids[0];

        tu.get('/v1/products?limit=10000', function(err, payload, res) {

          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);

          assert(!payload.error);
          assert(payload.data.length > 1);
          assert(payload.data.filter(function(p){
            return p.id == pid;
          }).length == 0)

          tu.del('/v1/products/' + pid, done);
        });
      });
    });
  });

  it('should paginate', function(done) {
    tu.get('/v1/products?offset=1&limit=1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should include tags if requested', function(done) {
    tu.get('/v1/products?include=tags', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data[0].tags);
      done();
    });
  });

  it('should include categories if requested', function(done) {
    tu.get('/v1/products?include=categories', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data[0].categories);
      done();
    });
  });

  it('should include tags and categories if requested', function(done) {
    tu.get('/v1/products?include[]=tags&include[]=categories', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data[0].tags);
      assert(payload.data[0].categories);
      done();
    });
  });

  it('should include collections if requested', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/products?include=collections&limit=1000', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.filter(function(p) { return p.collections[0] === "mypseudo" && p.id === 1; }).length === 1);
        assert(payload.data.filter(function(p) { return p.collections[0] === "2" && p.id === 3; }).length === 1);
        assert(payload.data.filter(function(p) { return p.collections.length > 0; }).length > 0);
        tu.logout(done);
      });
    });
  });

  it('should include likes/wants/tried if logged in', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/products', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.meta.userLikes == 3);
        assert(payload.meta.userWants == 1);
        assert(payload.meta.userTries == 1);
        assert(typeof payload.data[0].userLikes != 'undefined');
        assert(typeof payload.data[0].userWants != 'undefined');
        assert(typeof payload.data[0].userTried != 'undefined');
        tu.logout(done);
      });
    });
  });

  it('should include user photos if requested', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/products?include=userPhotos', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data[0].photos);
        done();
      });
    });
  });

  it('should be able to filter by likes if logged in', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/products?userLikes=true', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        var results = payload.data;
        for (var i = results.length - 1; i >= 0; i--){
          assert(results[i].userLikes === true);
        };
        tu.logout(done);
      });
    });
  });

  it('should be able to filter by tries if logged in', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/products?userTried=true', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        var results = payload.data;
        for (var i = results.length - 1; i >= 0; i--){
          assert(results[i].userTried === true);
        };
        tu.logout(done);
      });
    });
  });

  it('should be able to filter by wants if logged in', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/products?userWants=true', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        var results = payload.data;
        for (var i = results.length - 1; i >= 0; i--){
          assert(results[i].userWants === true);
        }
        tu.logout(done);
      });
    });
  });

  it('should filter by lat/lon/range', function(done) {
    tu.get('/v1/products?lat=10&lon=10&range=1000', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length >= 1);
      assert(payload.meta.total > 1);
      tu.get('/v1/products?lat=10&lon=10&range=100', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.length >= 1);
        assert(payload.data[0].distance <= 100);
        assert(payload.data[1].distance <= 100);
        assert(payload.meta.total >= 1);
        done();
      });
    });
  });

  it('should filter by a single tag', function(done) {
    tu.get('/v1/products?tag=food&include=tags', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p) {
        return (p.tags.filter(function(t) { return t.tag == 'food'; })).length == 0;
      }).length === 0); // make sure all rows have the 'food' tag
      done();
    });
  });

  it('should filter by multiple tags', function(done) {
    tu.get('/v1/products?tag[]=food&tag[]=fashion&include=tags', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p) {
        return (p.tags.filter(function(t) { return t.tag == 'food' || t.tag == 'fashion'; })).length == 0;
      }).length === 0); // make sure all rows have the 'food' or 'fashion' tag
      done();
    });
  });

  it('should filter by negated tags', function(done) {
    tu.get('/v1/products?tag=!food&include=tags', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p) {
        return (p.tags.indexOf('food') !== -1);
      }).length === 0); // make sure no rows have the 'food' tag
      done();
    });
  });

  it('should filter by multiple negated tags', function(done) {
    tu.get('/v1/products?tag=!food,!uniquetag&include=tags', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p) {
        return (p.tags.indexOf('food') !== -1 || p.tags.indexOf('uniquetag') !== -1);
      }).length === 0); // make sure all rows have neither the 'food' and 'unique' tag
      done();
    });
  });

  it('should filter by having photo', function(done) {
    tu.get('/v1/products?hasPhoto=1&limit=10000', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p) {
        return !p.photoUrl;
      }).length === 0);
      done();
    });
  });

  it('should sort ASC if no prefix is given', function(done) {
    tu.get('/v1/products?sort=name', function(err, payload, res) {
      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data[0].name == 'Anchors Away');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should sort DESC if a - prefix is given', function(done) {
    tu.get('/v1/products?sort=-name', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data[0].name > payload.data[1].name);
      assert(payload.data[1].name > payload.data[2].name);
      assert(payload.data[2].name > payload.data[3].name);
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should sort by random', function(done) {
    tu.get('/v1/products?sort=random', function(err, payload, res) {
      assert(!err);
      assert(res.statusCode == 200);
      done();
    });
  });

  it('should sort by distance if also given a location', function(done) {
    tu.get('/v1/products?lat=10&lon=10&sort=distance', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      done();
    });
  });

  it('should return 400 if asked to sort by distance and not given a location', function(done) {
    tu.get('/v1/products?sort=distance', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 400);
      done();
    });
  });

  it('should return 400 if the sort parameter is not recognized', function(done) {
    tu.get('/v1/products?sort=foobar', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 400);
      done();
    });
  });

  it('should filter products by name', function(done){

    tu.populate('products', [{ name: '__blah__', businessId: 1 }], function(error, pids){
      assert(!error);

      tu.get('/v1/products?filter=__bla', function(error, results, res){
        assert(!error);
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.length == 1);
        done();
      });
    });

  });

});

describe('GET /v1/locations/:locationId/products', function() {

  it('should respond with a product listing per location', function(done) {
    var locationId = 1;
    tu.get('/v1/locations/' + locationId + '/products', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 1);
      assert(payload.data[0].id == 1);
      assert(payload.data[0].businessId == 1);
      assert(payload.data[0].name == 'Product 1');
      assert(payload.data[0].inSpotlight == undefined);
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should respond with a product listing per location with spotlight', function(done) {
    var locationId = 1;
    tu.get('/v1/locations/' + locationId + '/products?spotlight=true', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 1);
      assert(payload.data[0].id == 1);
      assert(payload.data[0].businessId == 1);
      assert(payload.data[0].name == 'Product 1');
      assert(payload.data[0].inSpotlight == true);
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should respond with a product listing for all at the business', function(done) {
    var locationId = 1;
    tu.get('/v1/locations/' + locationId + '/products?all=true', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 1);
      assert(payload.data[0].id == 1);
      assert(payload.data[0].businessId == 1);
      assert(payload.data[0].name == 'Product 1');
      assert(payload.data[0].isAvailable == true);
      assert(payload.data.filter(function(p){ return !p.isAvailable; }).length > 0);

      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should respond with a product listing for all at the business', function(done) {
    var locationId = 1;
    var businessId = 1;

    tu.loginAsAdmin(function(){

      tu.post('/v1/products', { name: 'blaaahhh', businessId: businessId }, function(err, payload, res){

        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);

        var productId = payload.data.id;

        tu.get('/v1/locations/' + locationId + '/products?all=true&limit=100000', function(err, payload, res) {

          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);

          assert(!payload.error);
          assert(payload.data.length > 1);
          // Should bring be back both available and non-available products in all
          assert(payload.data.filter(function(p){ return p.isAvailable; }).length > 0);
          assert(payload.data.filter(function(p){ return !p.isAvailable; }).length > 0);
          assert(payload.data.filter(function(p){ return p.id == productId && p.businessId == businessId; }).length == 1);
          assert(payload.data.filter(function(p){ return p.businessId == businessId; }).length == payload.data.length);

          assert(payload.meta.total > 1);

          tu.logout(done);
        });
      });

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
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p){ return p.businessId == 1; }).length == payload.data.length);
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should respond with a product listing', function(done) {
    tu.get('/v1/businesses/1/products?include[]=tags&include[]=categories', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p){ return p.businessId == 1; }).length == payload.data.length);
      assert(payload.data.filter(function(p){ return p.tags.length > 0; }).length > 0);
      assert(payload.data.filter(function(p){ return p.categories.length > 0; }).length > 0);
      assert(payload.meta.total > 1);
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
  });

  it('should paginate', function(done) {
    tu.get('/v1/businesses/1/products?offset=1&limit=1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length == 1);
      assert(payload.meta.total > 1);
      done();
    });
  });
});

describe('GET /v1/products/food', function() {
  it('should respond with products from food businesses', function(done) {
    tu.get('/v1/products/food', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p) { return [2,39].indexOf(+p.businessId) === -1; }).length === 0); // 2 and 39 are the businesses tagged 'food'
      done();
    });
  });

  it('should allow the user to sort by popular', function(done) {
    tu.get('/v1/products/food?sort=-popular', function(err, payload, res) {
      assert(res.statusCode == 200);
      done();
    });
  });
});

describe('GET /v1/products/fashion', function() {
  it('should respond with products from fashion businesses', function(done) {
    tu.get('/v1/products/fashion', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p) { return [1,4].indexOf(+p.businessId) === -1; }).length === 0); // 1 and 4 are the businesses tagged 'apparel'
      done();
    });
  });
});

describe('GET /v1/products/other', function() {
  it('should respond with products from non-food and non-fashion businesses', function(done) {
    tu.get('/v1/products/other', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p) { return [1,2,4,39].indexOf(+p.businessId) !== -1; }).length === 0); // none of the guys tested above
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
      assert(typeof payload.data.businessIsGB != 'undefined');
      assert(payload.data.categories.length > 1);
      assert(payload.data.tags.length > 1);
      done();
    });
  });

  it('should include like/want/try if logged in', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/products/1', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.userLikes);
        assert(payload.data.userWants);
        assert(payload.data.userTried);
        done();
      });
    });
  });

  it('should include user photos if requested', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/products?include=userPhotos', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data[0].photos);
        done();
      });
    });
  });

  it('should respond 404 if product id is not in database', function(done){
    tu.get('/v1/products/100', function(err, payload, res) {
      assert(res.statusCode == 404);
      done();
    });
  });
});

describe('POST /v1/products', function() {

  it('should create a product and respond with the id of the new product', function(done) {
    tu.loginAsAdmin(function() {
      tu.post('/v1/products', JSON.stringify({ businessId:2, name:'asdf', price:1234 }), 'application/json', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);

        assert(!payload.error);
        assert(payload.data.id);
        tu.logout(done);
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.loginAsAdmin(function() {
      tu.post('/v1/products', JSON.stringify({ price:'foobar' }), 'application/json', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 400);

        payload = JSON.parse(payload);
        assert(payload.error);
        tu.logout(done);
      });
    });
  });

  it('should fail to add product because of an invalid product description length', function(done) {
    tu.loginAsAdmin(function() {
      var product = { businessId:2, name:'asdf', price:1234 };

      product.description = "";
      for (var i = 0; i < 451; i++){
        product.description += "a";
      }

      tu.post('/v1/products', JSON.stringify(product), 'application/json', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 400);

        payload = JSON.parse(payload);
        assert(payload.error);
        assert(payload.error.name == 'VALIDATION_FAILED');
        assert(payload.error.details.description);
        tu.logout(done);
      });
    });
  });

  it('should allow consumers to create an unverified product at an unverified and have it show in collection', function(done) {
    tu.login({ email:'tferguson@gmail.com', password:'password' }, function(error, user) {
      tu.post('/v1/products', JSON.stringify({ businessId:4, name:'asdf', price:1234 }), 'application/json', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.id);

        var pid = payload.data.id;
        tu.post('/v1/consumers/' + user.id + '/collections/1/products', { productId: pid }, function(error, payload, res){
          assert(!error);
          assert(res.statusCode == 204);

          tu.get('/v1/consumers/' + user.id + '/collections/all/products?limit=10000', function(error, payload, res){
            assert(!error);
            payload = JSON.parse(payload);

            assert(payload.data.filter(function(p){ return p.id == pid; }).length == 1);

            tu.logout(function() {
              tu.loginAsAdmin(function() {
                tu.get('/v1/products/'+pid, function(err, payload, res) {
                  assert(res.statusCode == 200);
                  payload = JSON.parse(payload);
                  assert(payload.data.isVerified === false);
                  tu.logout(done);
                });
              });
            });
          });
        });
      });
    });
  });

  it('should not allow negative prices', function(done) {
    tu.loginAsAdmin(function() {
      tu.post('/v1/products', JSON.stringify({ businessId:2, name:'asdf', price:-1234 }), 'application/json', function(err, payload, res) {
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });

  it('should fail to post new product because of invalid field', function (done){
    tu.loginAsAdmin(function() {
      tu.post('/v1/products', JSON.stringify({ businessId:2, name:'asdf', price:"jirjwyi" }), 'application/json', function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 400);
        payload = JSON.parse(payload);
        assert(payload.error);
        tu.logout(done);
      });
    });
  });

  it('should create a product with categories and respond with the id of the new product', function(done) {
    tu.loginAsAdmin(function() {
      tu.post('/v1/products', JSON.stringify({ businessId:1, name:'zzzzz', price:9999, categories: [1, 2] }), 'application/json', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);
        assert(!payload.error);
        assert(payload.data.id);
        tu.logout(done);
      });
    });
  });

  it('should fail to create a product with categories because of invalid categories', function(done) {
    tu.loginAsAdmin(function() {
      tu.post('/v1/products', JSON.stringify({ businessId:1, name:'zzzzz', price:9999, categories: [9999, 99999] }), 'application/json', function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 400);

        payload = JSON.parse(payload);

        assert(payload.error);
        assert(payload.error.name === "INVALID_CATEGORY_IDS");
        tu.logout(done);
      });
    });
  });

  it('should create a product with tags and respond with the id of the new product', function(done) {
    tu.loginAsAdmin(function() {
      tu.post('/v1/products', JSON.stringify({ businessId:1, name:'zzzzz', price:9999, tags: [1, 2] }), 'application/json', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);

        assert(!payload.error);
        assert(payload.data.id);

        tu.get('/v1/products/' + payload.data.id, function(error, payload){
          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);

          assert(!payload.error);

          assert(payload.data.tags.length > 0);
          tu.logout(done);
        });
      });
    });
  });

  it('should fail to create a product with tags because of invalid tags', function(done) {
    tu.loginAsAdmin(function() {
      tu.post('/v1/products', JSON.stringify({ businessId:1, name:'zzzzz', price:9999, tags: [999,999] }), 'application/json', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 400);

        payload = JSON.parse(payload);

        assert(payload.error);
        assert(payload.error.name === "INVALID_TAGS");
        tu.logout(done);
      });
    });
  });

  it('should create a product with categories and tags and respond with the id of the new product', function(done) {
    tu.loginAsAdmin(function() {
      tu.post('/v1/products', JSON.stringify({ businessId:1, name:'zzzzz', price:9999, categories: [1, 2], tags: [1, 2] }), 'application/json', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);

        assert(!payload.error);
        assert(payload.data.id);
        tu.logout(done);
      });
    });
  });
});


describe('PATCH /v1/products/:id', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsAdmin(function() {
      tu.patch('/v1/products/1', JSON.stringify({ name:'fdsa' }), 'application/json', function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.loginAsAdmin(function() {
      tu.patch('/v1/products/1', JSON.stringify({ price:'foobar' }), 'application/json', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 400);

        payload = JSON.parse(payload);
        assert(payload.error);
        tu.logout(done);
      });
    });
  });

  it('should fail to update product because of invalid field', function (done){
    tu.loginAsAdmin(function() {
      tu.post('/v1/products', JSON.stringify({ businessId:2, name:'asdf', price:"jirjwyi", description: "" }), 'application/json', function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 400);
        payload = JSON.parse(payload);
        assert(payload.error);
        tu.logout(done);
      });
    });
  });

  it('should update the products name and categories ', function(done) {
    tu.loginAsAdmin(function() {
      tu.patch('/v1/products/1', JSON.stringify({ name:'weeeeeeeeeee', categories: [1] }), 'application/json', function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

  it('should fail update the products name and categories because of an invalid categoryId', function(done) {
    tu.loginAsAdmin(function() {
      tu.patch('/v1/products/1', JSON.stringify({ name:'weeeeeeeeeee', categories: [9999] }), 'application/json', function(err, payload, res) {

        assert(!err);
        payload = JSON.parse(payload);
        assert(res.statusCode == 400);

        assert(payload.error);
        assert(payload.error.name === "INVALID_CATEGORY_IDS");
        tu.logout(done);
      });
    });
  });

  it('should update the products name and tags ', function(done) {
    tu.loginAsAdmin(function() {
      tu.patch('/v1/products/1', JSON.stringify({ name:'weeeeeeeeeee', tags: [1] }), 'application/json', function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

  it('should preserve tags and categories if not included in the PATCH', function(done) {
    tu.loginAsAdmin(function() {
      tu.patch('/v1/products/1', JSON.stringify({ name:'product 1', tags:[1], categories:[1] }), 'application/json', function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.patch('/v1/products/1', JSON.stringify({ name:'product 1' }), 'application/json', function(err, payload, res) {
          assert(res.statusCode == 204);
          tu.get('/v1/products/1', function(err, payload, res) {
            assert(res.statusCode == 200);
            payload = JSON.parse(payload);
            assert(!payload.error);
            assert(payload.data.tags[0].id == 1);
            assert(payload.data.categories[0].id == 1);
            tu.logout(done);
          });
        });
      });
    });
  });

});


describe('DELETE /v1/products/:id', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsAdmin(function() {
      tu.del('/v1/products/2', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 204);

        tu.logout(done);
      });
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
    tu.loginAsAdmin(function() {
      tu.post('/v1/products/1/categories', JSON.stringify({ id:3 }), 'application/json', function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

  it('should not duplicate existing category relations', function(done) {
    tu.loginAsAdmin(function() {
      tu.post('/v1/products/1/categories', JSON.stringify({ id:3 }), 'application/json', function(err, payload, res) {
        assert(res.statusCode == 204);

        tu.get('/v1/products/1/categories', function(err, payload, res) {

          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);

          assert(!payload.error);
          assert(payload.data.length >= 1);
          tu.logout(done);
        });
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {

    tu.loginAsAdmin(function() {
      tu.post('/v1/products/1/categories', JSON.stringify({ id:'foobar' }), 'application/json', function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 400);

        payload = JSON.parse(payload);

        assert(payload.error);
        tu.logout(done);
      });
    });
  });

});

describe('DELETE /v1/products/:id/categories/:id', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsAdmin(function() {
      tu.del('/v1/products/1/categories/3', function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

});

describe('POST /v1/products/:id/feelings', function() {
  it('should tapin-auth a new user and update their feelings and return firstTapin, userId', function(done){
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      assert(!error);

      tu.tapinAuthRequest('POST', '/v1/products/3/feelings', '432123-BAC', { isLiked: true }, function(error, payload, res){
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.meta.isFirstTapin);
        assert(payload.meta.userId > 0);
        tu.logout(done);
      });
    });
  });

  it('should add to the product feelings totals', function(done) {
    tu.login({ email:'consumer7@gmail.com', password:'password' }, function() {
      tu.get('/v1/products/3', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.likes === 1);
        assert(payload.data.wants === 0);
        assert(payload.data.tries === 0);
        assert(payload.data.userLikes == false);
        assert(payload.data.userWants == false);
        assert(payload.data.userTried == false);

        tu.post('/v1/products/3/feelings', { isLiked:true, isWanted:true, isTried:true }, function(err, payload, res) {
          assert(res.statusCode == 204);

          tu.get('/v1/products/3', function(err, payload, res) {
            assert(!err);
            assert(res.statusCode == 200);

            payload = JSON.parse(payload);
            assert(payload.data.likes >= 1);
            assert(payload.data.wants == 1);
            assert(payload.data.tries == 1);
            assert(payload.data.userLikes == true);
            assert(payload.data.userWants == true);
            assert(payload.data.userTried == true);

            tu.logout(done);
          });
        });
      });
    });
  });

  it('should not alter the counters if the user has already felt', function(done) {
    tu.login({ email:'consumer7@gmail.com', password:'password' }, function() {
      tu.get('/v1/products/3', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.likes >= 1);
        assert(payload.data.wants === 1);
        assert(payload.data.tries === 1);
        assert(payload.data.userLikes == true);
        assert(payload.data.userWants == true);
        assert(payload.data.userTried == true);

        tu.post('/v1/products/3/feelings', { isLiked:true, isWanted:true, isTried:true }, function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 204);

          tu.get('/v1/products/3', function(err, payload, res) {
            assert(!err);
            assert(res.statusCode == 200);

            payload = JSON.parse(payload);
            assert(payload.data.likes >= 1);
            assert(payload.data.wants == 1);
            assert(payload.data.tries == 1);
            assert(payload.data.userLikes == true);
            assert(payload.data.userWants == true);
            assert(payload.data.userTried == true);

            tu.logout(function() {
              done();
            });
          });
        });
      });
    });
  });

  it('should accept string representations of true/false as valid inputs', function(done) {
    tu.login({ email:'consumer7@gmail.com', password:'password' }, function() {
      tu.get('/v1/products/3', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.likes >= 1);
        assert(payload.data.wants === 1);
        assert(payload.data.tries === 1);
        assert(payload.data.userLikes == true);
        assert(payload.data.userWants == true);
        assert(payload.data.userTried == true);

        tu.post('/v1/products/3/feelings', { isLiked:'true', isWanted:'false', isTried:'true' }, function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 204);

          tu.get('/v1/products/3', function(err, payload, res) {
            assert(!err);
            assert(res.statusCode == 200);

            payload = JSON.parse(payload);
            assert(payload.data.likes >= 1);
            assert(payload.data.wants == 0);
            assert(payload.data.tries == 1);
            assert(payload.data.userLikes == true);
            assert(payload.data.userWants == false);
            assert(payload.data.userTried == true);

            tu.logout(function() {
              done();
            });
          });
        });
      });
    });
  });

  it('should remove from the product feelings totals', function(done) {
    tu.login({ email:'consumer7@gmail.com', password:'password' }, function() {
      tu.get('/v1/products/3', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.likes >= 1);
        assert(payload.data.wants === 0);
        assert(payload.data.tries === 1);
        assert(payload.data.userLikes == true);
        assert(payload.data.userWants == false);
        assert(payload.data.userTried == true);

        tu.post('/v1/products/3/feelings', { isTried:false }, function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 204);

          tu.get('/v1/products/3', function(err, payload, res) {
            assert(!err);
            assert(res.statusCode == 200);

            payload = JSON.parse(payload);
            assert(payload.data.likes >= 1);
            assert(payload.data.wants == 0);
            assert(payload.data.tries == 0);
            assert(payload.data.userLikes == true);
            assert(payload.data.userWants == false);
            assert(payload.data.userTried == false);

            tu.logout(function() {
              done();
            });
          });
        });
      });
    });
  });

  it('should only remove likes/wants/tries if the user had previously felt', function(done) {
    tu.login({ email:'consumer7@gmail.com', password:'password' }, function() {
      tu.get('/v1/products/4', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.likes === 0);
        assert(payload.data.wants === 0);
        assert(payload.data.tries === 0);
        assert(payload.data.userLikes == false);
        assert(payload.data.userWants == false);
        assert(payload.data.userTried == false);

        tu.post('/v1/products/4/feelings', { isLiked:false }, function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 204);

          tu.get('/v1/products/4', function(err, payload, res) {
            assert(!err);
            assert(res.statusCode == 200);

            payload = JSON.parse(payload);
            assert(payload.data.likes == 0);
            assert(payload.data.wants == 0);
            assert(payload.data.tries == 0);
            assert(payload.data.userLikes == false);
            assert(payload.data.userWants == false);
            assert(payload.data.userTried == false);

            tu.logout(function() {
              done();
            });
          });
        });
      });
    });
  });

  it('should maintain the tally by user', function(done) {
    tu.loginAsSales(function() {
      tu.post('/v1/products/3/feelings', { isLiked:false, isWanted:true, isTried:true }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 204);

        tu.get('/v1/products/3', function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);
          assert(payload.data.likes >= 1);
          assert(payload.data.wants == 1);
          assert(payload.data.tries == 1);

          tu.logout(function() {
            done();
          });
        });
      });
    });
  });

  it('should keep the tallies on track during high volumes of requests', function(done) {
    tu.login({ email:'consumer7@gmail.com', password:'password' }, function() {
      var counter = 0;
      var iterate = function() {
        tu.post('/v1/products/4/feelings', { isLiked:true, isWanted:true, isTried:true }, function(err, payload, res) {
          assert(res.statusCode == 204);
          tu.get('/v1/products/4', function(err, payload, res) {
            assert(res.statusCode == 200);
            payload = JSON.parse(payload);
            assert(payload.data.likes === 1);
            assert(payload.data.wants === 1);
            assert(payload.data.tries === 1);
            tu.post('/v1/products/4/feelings', { isLiked:false, isWanted:false, isTried:false }, function(err, payload, res) {
              assert(res.statusCode == 204);
              tu.get('/v1/products/4', function(err, payload, res) {
                assert(res.statusCode == 200);
                payload = JSON.parse(payload);
                assert(payload.data.likes === 0);
                assert(payload.data.wants === 0);
                assert(payload.data.tries === 0);
                if (counter++ >= 10)
                  tu.logout(done);
                else
                  iterate();
              });
            });
          });
        });
      };
      iterate();
    });
  });

  it('should keep the tallies on track during high volumes of requests', function(done) {
    tu.login({ email:'consumer7@gmail.com', password:'password' }, function() {
      var counter = 0;
      var iterate = function() {
        tu.post('/v1/products/4/feelings', { isLiked:false, isWanted:false, isTried:false }, function(err, payload, res) {
          assert(res.statusCode == 204);
          tu.get('/v1/products/4', function(err, payload, res) {
            assert(res.statusCode == 200);
            payload = JSON.parse(payload);
            assert(payload.data.likes === 0);
            assert(payload.data.wants === 0);
            assert(payload.data.tries === 0);
            tu.post('/v1/products/4/feelings', { isLiked:false, isWanted:false, isTried:false }, function(err, payload, res) {
              assert(res.statusCode == 204);
              tu.get('/v1/products/4', function(err, payload, res) {
                assert(res.statusCode == 200);
                payload = JSON.parse(payload);
                assert(payload.data.likes === 0);
                assert(payload.data.wants === 0);
                assert(payload.data.tries === 0);
                if (counter++ >= 10)
                  tu.logout(done);
                else
                  iterate();
              });
            });
          });
        });
      };
      iterate();
    });
  });

});


describe('PUT /v1/products/:id/feelings', function() {
  it('should tapin-auth a new user and update their feelings and return firstTapin, userId', function(done){
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      assert(!error);

      tu.tapinAuthRequest('PUT', '/v1/products/3/feelings', '432123-BAC', { isLiked: true }, function(error, payload, res){
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });
});


describe('location list filtering', function() {
  it('should maintain freshness as locations are added, changed, and removed', function(done) {
    tu.loginAsAdmin(function() {
      tu.post('/v1/locations', { businessId:1, name:'asdf', lat:5, lon:5 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 200);

        tu.post('/v1/locations', { businessId:1, name:'asdf', lat:5.001, lon:5.001 }, function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 200);

          var idToDelete = JSON.parse(payload).data.id;

          tu.post('/v1/locations', { businessId:3, name:'asdf',  lat:15.002, lon:15.002 }, function(err, payload, res) {
            assert(!err);
            assert(res.statusCode == 200);

            var idToUpdate = JSON.parse(payload).data.id;

            tu.del('/v1/locations/'+idToDelete, function(err, payload, res) {
              assert(!err);
              assert(res.statusCode == 204);

              tu.patch('/v1/locations/'+idToUpdate, { lat:5.002, lon:5.002 }, function(err, payload, res) {
                assert(!err);
                assert(res.statusCode == 204);

                tu.get('/v1/products?lat=5&lon=5&range=10000', function(err, payload, res) {
                  assert(!err);
                  assert(res.statusCode == 200);

                  payload = JSON.parse(payload);
                  assert(payload.data.filter(function(item) { return item.businessId != 1 && item.businessId != 3; }).length === 0); // should only have results from business 1 or 3

                  tu.logout(function() {
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
  // :TODO: pending updates to routes
  it('should provide distinct products'/*, function(done) {
    tu.loginAsAdmin(function() {

      // add a location that would result in duplicate results
      tu.post('/v1/locations', { businessId:1, name:'asdf', lat:5.001, lon:5.001 }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 200);

        tu.get('/v1/products?lat=5&lon=5&range=10000', function(err, payload, res) {
          assert(!err);
          assert(res.statusCode == 200);

          payload = JSON.parse(payload);
          var usedIds = {};
          payload.data.forEach(function(item) {
            assert(!usedIds[item.id]);
            usedIds[item.id] = true;
          });

          tu.logout(function() {
            done();
          });
        });
      });
    });
  }*/);
});
