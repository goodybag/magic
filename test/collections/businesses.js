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

  it('should respond with a single business document with fields ' + perms.world.read.join(', '), function(done) {
    var id = 1;
    tu.get('/v1/businesses/' + id, function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.id === id);

      for (var key in payload.data){
        assert(perms.world.read.indexOf(key) > -1);
      }

      done();
    });
  });

  var permFields = perms.default.read.concat(perms.world.read);
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
        tu.logout(function(){
          done();
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
        tu.logout(function(){
          done();
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