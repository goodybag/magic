var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
;

describe('GET /v1/charities', function() {
  it('should respond with a charity listing', function(done) {
    tu.populate('charities', [{ name:'Charity 1' }, { name:'Charity 2' }], function(err, ids) {
      tu.get('/v1/charities', function(err, results, res) {
        assert(res.statusCode == 200);
        var payload = JSON.parse(results);
        assert(payload.data.length === 2);
        assert(payload.data[0].id);
        assert(payload.data[0].name == 'Charity 1');
        assert(payload.data[1].name == 'Charity 2');
        assert(payload.meta.total === 2);
        tu.depopulate('charities', ids, done);
      });
    });
  });
  it('should filter', function(done) {
    tu.populate('charities', [{ name:'Charity 1' }, { name:'Charity 2' }], function(err, ids) {
      tu.get('/v1/charities?filter=2', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.length === 1);
        assert(payload.data[0].name == 'Charity 2');
        tu.depopulate('charities', ids, done);
      });
    });
  });
  it('should paginate', function(done) {
    tu.populate('charities', [{ name:'Charity 1' }, { name:'Charity 2' }], function(err, ids) {
      tu.get('/v1/charities?offset=1&limit=1', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.length === 1);
        assert(payload.data[0].name == 'Charity 2');
        assert(payload.meta.total === 2);
        tu.depopulate('charities', ids, done);
      });
    });
  });
});

describe('GET /v1/charities/:id', function() {
  it('should respond with a single charity document', function(done) {
    tu.populate('charities', [{ name:'Charity 1' }], function(err, ids) {
      tu.get('/v1/charities/' + ids[0], function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.id === ids[0]);
        tu.depopulate('charities', ids, done);
      });
    });
  });

  it('should return 404 if the id is not in the database', function(done){
    tu.get('/v1/charities/5', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should return 404 if the id is not in correct type', function(done){
    tu.get('/v1/charities/asdf', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });
});

describe('DEL /v1/charities/:id', function() {
  it('should delete a single charity document', function(done) {
    tu.populate('charities', [{ name:'Charity 1' }], function(err, ids) {
      tu.loginAsAdmin(function(error, user){
        // get the current count
        tu.get('/v1/charities', function(err, results, res) {
          var total = JSON.parse(results).meta.total;
          tu.del('/v1/charities/'+ids[0], function(err, results, res) {
            assert(res.statusCode == 204);
            // compare to updated count
            tu.get('/v1/charities', function(err, results, res) {
              assert(parseInt(total, 10) - 1 === parseInt(JSON.parse(results).meta.total, 10));
              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should fail to delete a single charity document because not logged in', function(done) {
    tu.del('/v1/charities/3', function(err, results, res) {
      assert(!err);
      assert(res.statusCode == 401);
      tu.logout(function(){
        done();
      });
    });
  });
});

describe('POST /v1/charities', function(){
  it('should save a charity and return the id', function(done){
    var charity = {
      name: "Ballers, Inc."
    , desc: "A charity"
    , logoUrl: "http://ballersinc.com"
    };

    tu.loginAsSales(function(error, user){
      tu.post('/v1/charities', charity, function(error, results, res){
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

  it('should fail to save a charity because of a validation error', function(done){
    tu.loginAsSales(function(error, user){
      tu.post('/v1/charities', {}, function(error, results, res){
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

describe('PATCH /v1/charities/:id', function(){
  it('should update a charity\'s name and url', function(done){    
    tu.populate('charities', [{ name:'Charity 1' }], function(err, ids) {
      tu.loginAsSales(function(error, user){
        tu.patch('/v1/charities/'+ids[0], { name: "Poophead McGees", logoUrl: "http://pmcgee.com" }, function(error, results, res){
          assert(!error);
          assert(res.statusCode == 204);
          tu.logout(function(){ tu.depopulate('charities', ids, done); });
        });
      });
    });
  });

  it('should fail to update a charity because of an invalid field', function(done){
    var charity = {
      logoUrl: 123
    };
    tu.loginAsSales(function(error, user){
      tu.patch('/v1/charities/' + 1, charity, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });

  it('should fail because user not allow to update information', function(done){
    var charity = {
      name: "Poophead McGees"
      , logoUrl: "http://www.google.com"
    };
    tu.loginAsClient(function(error, user){
     tu.post('/v1/charities/' + 1, charity, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 403);
        tu.logout(done);
      });
    });
  });
});