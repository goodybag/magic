var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')

, baseUrl = config.baseUrl
;

describe('GET /v1/photos', function() {

  it('should respond with a photo listing', function(done) {
    tu.get('/v1/photos', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 0);
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should paginate', function(done) {
    tu.get('/v1/photos?offset=1&limit=1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.meta.total > 1);
      done();
    });
  });

});


describe('GET /v1/businesses/:id/photos', function() {

  it('should respond with a photo listing', function(done) {
    tu.get('/v1/businesses/1/photos', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 1);
      assert(payload.meta.total > 1);
      var photo = payload.data[0];
      assert(photo.createdAt, 'photo should have a createdAt date');
      done();
    });
  });

  it('should return empty with invalid businesses id', function(done){
    tu.get('/v1/businesses/100/photos', function(err, payload) {

      assert(!err);
      payload = JSON.parse(payload);
      assert(!payload.error);
      assert(payload.data.length == 0);
      done();
    });
  })

  it('should paginate', function(done) {
    tu.get('/v1/businesses/1/photos?offset=1&limit=1', function(err, payload, res) {

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


describe('GET /v1/photos/:id', function() {

  it('should respond with a photo', function(done) {
    tu.get('/v1/photos/1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.id == 1);
      assert(payload.data.createdAt, 'should have a createdAt date');
      done();
    });
  });

});


describe('POST /v1/photos', function() {

  it('should respond with the id of a new photo', function(done) {
    tu.loginAsSales(function(error, user){
      tu.post('/v1/photos', { productId:1, url:'http://placekitten.com/400/300' }, function(err, payload, res) {
        assert(!err);
        payload = JSON.parse(payload);
        assert(res.statusCode == 200);

        assert(!payload.error);
        assert(payload.data.id);
        tu.logout(done);
      });
    });
  });

 it('should respond with 400 if the product doesnt exist', function(done) {
    tu.loginAsSales(function(error, user){
      tu.post('/v1/photos', { productId:2, url:'http://placekitten.com/400/300' }, function(err, payload, res) {
        assert(!err);
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.loginAsSales(function(error, user){
      tu.post('/v1/photos', { productId:'foobar' }, function(err, payload, res) {
        assert(!err);
        payload = JSON.parse(payload);
        assert(res.statusCode == 400);

        assert(payload.error);
        tu.logout(done);
      });

    });
  });

});


describe('POST /v1/products/:id/photos', function() {

  it('should respond with the id of a new photo', function(done) {
    tu.loginAsSales(function(error, user){
      tu.post('/v1/products/1/photos', { url:'http://placekitten.com/400/300' }, function(err, payload, res) {
        assert(!err);
        payload = JSON.parse(payload);
        assert(res.statusCode == 200);

        assert(!payload.error);
        assert(payload.data.id);
        tu.logout(done);
      });
    });
  });

});

describe('PATCH /v1/photos/:id', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      tu.patch('/v1/photos/2', { isEnabled:true }, function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.loginAsSales(function(error, user){
      tu.patch('/v1/photos/2', { businessId:'foobar' }, function(err, payload, res) {

        assert(!err);
        payload = JSON.parse(payload);
        assert(res.statusCode == 400);

        assert(payload.error);
        tu.logout(done);
      });
    });
  });

  it('should not allow a non-owning consumer to update', function(done) {
    tu.login({ email:'consumer4@gmail.com', password:'password' }, function() {
      tu.patch('/v1/photos/2', { notes:'this wont happen' }, function(err, payload, res) {
        assert(res.statusCode == 403);
        tu.logout(done);
      });
    });
  });

  it('should allow an owning consumer to update and read', function(done) {
    tu.login({ email:'consumer3@gmail.com', password:'password' }, function() {
      tu.patch('/v1/photos/2', { notes:'this will happen' }, function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.get('/v1/photos/2', function(err, payload, res) {
          assert(res.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data.notes == 'this will happen');
          tu.logout(done);
        });
      });
    });
  });

  it('should not allow a non-owning-business manager to update', function(done) {
    tu.login({ email:'manager_redeem3@gmail.com', password:'password' }, function() {
      tu.patch('/v1/photos/2', { isEnabled:true }, function(err, payload, res) {
        assert(res.statusCode == 403);
        tu.logout(done);
      });
    });
  });

  it('should allow an owning business manager to update', function(done) {
    tu.login({ email:'some_manager@gmail.com', password:'password' }, function() {
      tu.patch('/v1/photos/2', { isEnabled:true }, function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

  it('should not allow a non-owning-business cashier to update', function(done) {
    tu.login({ email:'cashier_redeem3@gmail.com', password:'password' }, function() {
      tu.patch('/v1/photos/2', { isEnabled:true }, function(err, payload, res) {
        assert(res.statusCode == 403);
        tu.logout(done);
      });
    });
  });

  it('should allow an owning business cashier to update', function(done) {
    tu.login({ email:'some_cashier@gmail.com', password:'password' }, function() {
      tu.patch('/v1/photos/2', { isEnabled:true }, function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

});


describe('DELETE /v1/photos/:id', function() {
  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      tu.del('/v1/photos/2', function(err, payload, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
      });
    });
  });

});
