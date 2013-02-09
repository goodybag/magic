var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
, perms   = require('../../collections/businesses/permissions')
;

describe('GET /v1/businesses', function() {
  it('should respond with a business listing', function(done) {
    tu.get('/v1/businesses', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.length > 0);
      assert(payload.data[0].id);
      assert(payload.data[0].name.length > 0);
      assert(payload.meta.total > 1);
      done();
    });
  });
  it('should filter', function(done) {
    tu.get('/v1/businesses?filter=2', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name.length > 0);
      done();
    });
  });
  it('should filter', function(done) {
    tu.get('/v1/businesses?filter=bus', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.length > 0);
      done();
    });
  });

  it('should filter by a single tag', function(done) {
    tu.get('/v1/businesses?tag=uniquetag', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length == 1);
      done();
    });
  });

  it('should filter by mutliple tags', function(done) {
    tu.get('/v1/businesses?tag[]=food&tag[]=apparel', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length == 4);
      done();
    });
  });
  it('should paginate', function(done) {
    tu.get('/v1/businesses?offset=1&limit=1', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name.length > 0);
      assert(payload.meta.total > 1);
      done();
    });
  });
  it('should include locations on include=locations', function(done) {
    tu.get('/v1/businesses?include=locations', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data[0].locations.length > 0);
      assert(payload.data[0].locations[0].lat != null && payload.data[0].locations[0].lat != undefined);
      assert(payload.data[0].locations[0].lon != null && payload.data[0].locations[0].lon != undefined);
      done();
    });
  });
});

describe('GET /v1/businesses/food', function() {
  it('should respond with food items', function(done) {
    tu.get('/v1/businesses/food?include=tags', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p) {
        return (p.tags.indexOf('food') === -1);
      }).length === 0); // make sure all rows have the 'food' tag
      done();
    });
  });

  it('should not allow the user to filter by tags', function(done) {
    tu.get('/v1/businesses/food?tag=foobar&include=tags', function(err, payload, res) {
      assert(res.statusCode == 400);
      done();
    });
  });
});

describe('GET /v1/businesses/fashion', function() {
  it('should respond with fashion items', function(done) {
    tu.get('/v1/businesses/fashion?include=tags', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p) {
        return (p.tags.indexOf('apparel') === -1);
      }).length === 0); // make sure all rows have the 'apparel' tag
      done();
    });
  });

  it('should not allow the user to filter by tags', function(done) {
    tu.get('/v1/businesses/fashion?tag=foobar&include=tags', function(err, payload, res) {
      assert(res.statusCode == 400);
      done();
    });
  });
});

describe('GET /v1/businesses/other', function() {
  it('should respond with non-food and non-fashion items', function(done) {
    tu.get('/v1/businesses/other?include=tags', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length > 0);
      assert(payload.data.filter(function(p) {
        return (p.tags.indexOf('food') !== -1 || p.tags.indexOf('apparel') !== -1);
      }).length === 0); // make sure no rows have the 'food' or 'apparel' tag
      done();
    });
  });
});

describe('GET /v1/businesses/:id', function() {
  it('should respond with a single business document', function(done) {
    var id = 1;
    tu.get('/v1/businesses/' + id, function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.id === id);
      done();
    });
  });

  it('should return 404 if the id is not in the database', function(done){
    tu.get('/v1/businesses/5', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should return 404 if the id is not in correct type', function(done){
    tu.get('/v1/businesses/asdf', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should respond with a single business document with fields ' + perms.business.world.read.join(', '), function(done) {
    var id = 1;
    tu.get('/v1/businesses/' + id, function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.id === id);

      for (var key in payload.data){
        assert(perms.business.world.read.indexOf(key) > -1);
      }

      done();
    });

  });

  it('should respond with a businesses loyalty settings', function(done) {
    var id = 1;
    tu.get('/v1/businesses/' + id + '/loyalty', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.businessId === id);
      done();
    });
  });

  var permFields = perms.business.default.read.concat(perms.business.world.read);
  it('should respond with a single business document with fields ' + permFields.join(', '), function(done) {
    tu.loginAsConsumer(function(error){
      assert(!error);
      var id = 1;
      tu.get('/v1/businesses/' + id, function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.id === id);

        for (var key in payload.data){
          assert(permFields.indexOf(key) > -1);
        }

        tu.logout(done);
      });
    });
  });
});

describe('DEL /v1/businesses/:id', function() {
  it('should delete a single business document', function(done) {
    tu.loginAsAdmin(function(error, user){
      // get the current count
      tu.get('/v1/businesses', function(err, results, res) {
        var total = JSON.parse(results).meta.total;
        tu.del('/v1/businesses/3', function(err, results, res) {
          assert(!err);
          assert(res.statusCode == 200)
          // compare to updated count
          tu.get('/v1/businesses', function(err, results, res) {
            assert(parseInt(total) - 1 === parseInt(JSON.parse(results).meta.total));
            tu.logout(done);
          });
        });
      });
    });
  });

  it('should fail to delete a single business document because not logged in', function(done) {
    tu.del('/v1/businesses/3', function(err, results, res) {
      assert(!err);
      assert(res.statusCode == 401);
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
    , charityId: 2
    , url: "http://ballersinc.com"
    , cardCode: "123456"
    , street1: "123 Sesame St"
    , street2: 'asdf'
    , city: "Austin"
    , state: "TX"
    , zip: 78756
    , tags: ['foo', 'bar']
    };

    tu.loginAsSales(function(error, user){
      tu.post('/v1/businesses', business, function(error, results, res){
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.id);

        tu.get('/v1/businesses/' + results.data.id, function(error, results){
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);
          // is gb false by default
          assert(results.data.isGB === false);
          assert(results.data.isVerified === false);
          tu.logout(function(){
            done();
          });
        });
      });
    });
  });

  it('should save a verified goodybag business and return the id', function(done){
    var business = {
      name: "Ballers, Inc. 3"
    , charityId: 2
    , url: "http://ballersinc.com"
    , cardCode: "123456"
    , street1: "123 Sesame St"
    , street2: 'asdf'
    , city: "Austin"
    , state: "TX"
    , zip: 78756
    , isGB: true
    , isVerified: true
    , tags: ['foo', 'bar']
    };

    tu.loginAsSales(function(error, user){
      tu.post('/v1/businesses', business, function(error, results, res){
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.id);

        tu.get('/v1/businesses/' + results.data.id, function(error, results){
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);
          assert(results.data.isGB === true);
          assert(results.data.isVerified === true);
          tu.logout(function(){
            done();
          });
        });
      });
    });
  });

  it('should save a business with a null url and return the id', function(done){
    var business = {
      name: "Ballers, Inc. 2"
    , charityId: 2
    , url: null
    , cardCode: "123456"
    , street1: "123 Sesame St"
    , street2: 'asdf'
    , city: "Austin"
    , state: "TX"
    , zip: 78756
    , tags: ['foo', 'bar']
    };

    tu.loginAsSales(function(error, user){
      tu.post('/v1/businesses', business, function(error, results, res){
        assert(!error);
        results = JSON.parse(results);
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
      tu.post('/v1/businesses', business, function(error, results, res){
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

describe('PATCH /v1/businesses/:id', function(){
  it('should update a business\'s name and url', function(done){
    var business = {
      name: "Poophead McGees"
    , url: "http://pmcgee.com"
    };

    tu.loginAsSales(function(error, user){
      tu.patch('/v1/businesses/' + 1, business, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(!results.error);
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should login as a businesses manager and update the loyalty settings', function(done){
    tu.login({ email: 'some_manager@gmail.com', password: 'password' }, function(error, user){
      assert(!error);
      var loyalty = {
        requiredItem: 'Coffee'
      , reward: 'Chicken'
      };

      tu.patch('/v1/businesses/' + 1 + '/loyalty', loyalty, function(error, results, res){
        assert(!error);
        results = JSON.parse(results);
        assert(res.statusCode == 200);

        assert(!results.error);

        tu.get('/v1/businesses/' + 1 + '/loyalty', function(error, results, res){
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);

          assert(results.data.requiredItem === loyalty.requiredItem);
          assert(results.data.reward === loyalty.reward);

          tu.logout(done);
        });
      });
    });
  });

  it('should login as a businesses manager and upsert the loyalty settings', function(done){
    tu.login({ email: 'manager_of_biz_without_loyalty@gmail.com', password: 'password' }, function(error, user){
      assert(!error);
      var loyalty = {
        requiredItem: 'Something'
      , reward: 'Some reward'
      , regularPunchesRequired: 10
      , elitePunchesRequired: 8
      , punchesRequiredToBecomeElite: 24
      , photoUrl: 'http://placekitten.com/200/300'
      };

      tu.patch('/v1/businesses/' + 4 + '/loyalty', loyalty, function(error, results, res){
        assert(!error);
        results = JSON.parse(results);
        assert(res.statusCode == 200);

        assert(!results.error);

        tu.get('/v1/businesses/' + 4 + '/loyalty', function(error, results, res){
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);

          assert(results.data.requiredItem === loyalty.requiredItem);
          assert(results.data.reward === loyalty.reward);

          tu.logout(done);
        });
      });
    });
  });

  it('should fail to update the loyalty settings because of invalid permissions', function(done){
    tu.login({ email: 'manager_redeem3@gmail.com', password: 'password' }, function(error, user){
      assert(!error);

      var loyalty = {
        requiredItem: 'Taco Bell'
      , reward: 'Poop'
      };

      tu.patch('/v1/businesses/' + 1 + '/loyalty', loyalty, function(error, results, res){
        assert(!error);

        results = JSON.parse(results);
        assert(results.error);
        assert(results.error.name === "NOT_ALLOWED");

        tu.get('/v1/businesses/' + 1 + '/loyalty', function(error, results, res){
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);

          assert(results.data.requiredItem != loyalty.requiredItem);
          assert(results.data.reward != loyalty.reward);

          tu.logout(done);
        });
      });
    });
  });

  it('should update a business\'s url to be null', function(done){
    var business = {
      url: null
    };

    tu.loginAsSales(function(error, user){
      tu.patch('/v1/businesses/' + 1, business, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 200);
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should update a business\'s url to be blank', function(done){
    var business = {
      url: ''
    };

    tu.loginAsSales(function(error, user){
      tu.patch('/v1/businesses/' + 1, business, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 200);
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should update a business\'s tags', function(done){
    var business = {
      tags:['foo','bar','baz']
    };

    tu.loginAsSales(function(error, user){
      tu.patch('/v1/businesses/1', business, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 200);
        tu.get('/v1/businesses/1', function(error, results, res) {
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.tags[0] == 'foo');
          assert(results.data.tags[1] == 'bar');
          assert(results.data.tags[2] == 'baz');
          tu.logout(done);
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
      tu.patch('/v1/businesses/' + 1, business, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 400);
        tu.logout(function(){
          done();
        });
      });
    });
  });

  it('should fail because user not allow to update information', function(done){
    var business = {
      name: "Poophead McGees"
      , url: "http://www.google.com"
    };
    tu.loginAsClient(function(error, user){
     tu.patch('/v1/businesses/' + 1, business, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 403);
        tu.logout(function(){
          done();
        });
      });
    });
  });
});