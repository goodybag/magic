var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
;

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
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should paginate', function(done) {
    tu.get('/v1/locations?offset=1&limit=1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name == 'Location 2');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should filter by lat/lon', function(done) {
    tu.get('/v1/locations?lat=10&lon=10', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 2);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.data[1].name == 'Location 2');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should filter by lat/lon/range', function(done) {
    tu.get('/v1/locations?lat=10&lon=10&range=100', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should filter by a single tag', function(done) {
    tu.get('/v1/locations?tag=food', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should filter by mutliple tags', function(done) {
    tu.get('/v1/locations?tag[]=food&tag[]=fashion', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should sort ASC if a + prefix is given', function(done) {
    tu.get('/v1/locations?sort=+name', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should sort ASC if no prefix is given', function(done) {
    tu.get('/v1/locations?sort=name', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should sort DESC if a - prefix is given', function(done) {
    tu.get('/v1/locations?sort=-name', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should sort by distance if also given a location', function(done) {
    tu.get('/v1/locations?lat=10&lon=10&sort=+distance', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should return 400 if asked to sort by distance and not given a location', function(done) {
    tu.get('/v1/locations?sort=+distance', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should return 400 if the sort parameter is not recognized', function(done) {
    tu.get('/v1/locations?sort=foobar', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.meta.total > 1);
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
      assert(payload.data.length > 0);
      assert(payload.data[0].id == 1);
      assert(payload.data[0].businessId == 1);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should respond nothing to invalid business id', function(done) {
    tu.get('/v1/businesses/100/locations', function(error, results, res) {
      assert(!error);
      results = JSON.parse(results);
      assert(results.data.length === 0);
      done();
    });
  });

  it('should respond nothing to invalid business id type', function(done) {
    tu.get('/v1/businesses/abcd/locations', function(error, results, res) {
      assert(!error);
      results = JSON.parse(results);
      assert(results.data.length === 0);
      done();
    });
  });

  it('should paginate', function(done) {
    tu.get('/v1/businesses/1/locations?offset=1&limit=1', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.data[0].name);
      assert(payload.meta.total > 1);
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

  it('should respond 404 with invalid location id', function(done) {
    tu.get('/v1/locations/100', function(error, results, res) {
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should respond 404 with invalid location id type', function(done) {
    tu.get('/v1/locations/abcd', function(error, results, res) {
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });
});

describe('POST /v1/locations', function() {

  it('should respond with the id of a new location', function(done) {
    tu.loginAsSales(function(error, user){
      var bus = {
        businessId:2,
        name:'asdf', 
        street1:'asdf', 
        city:'asdf', 
        state:'AS', 
        zip:'12345', 
        country:'asdf', 
        lat:5, 
        lon:-5,
        startMonday:'11:00 am',
        endMonday:'5:00 pm',
        startTuesday:'11:00 am',
        endTuesday:'5:00 pm',
        startWednesday:'11:00 am',
        endWednesday:'5:00 pm',
        startThursday:'11:00 am',
        endThursday:'5:00 pm',
        startFriday:'11:00 am',
        endFriday:'4:30 pm'
      };
      tu.post('/v1/locations', bus, function(err, results, res) {
        assert(!err);
        assert(res.statusCode == 200);

        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.id);

        tu.logout(done);
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.loginAsSales(function(error, user){
      tu.post('/v1/locations', { businessId:'foobar', name:'barfoo', endWednesday:'5pm' }, function(err, results, res) {
        assert(!err);
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });

  it('should return error of validation', function(done){
    tu.loginAsSales(function(error, user){
      tu.post('/v1/locations', { businessId:2, name:'', street1:'', city:'', state:'', zip:'', country:'' }, function(err, results, res) {
        assert(!err);
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });
});


describe('PATCH /v1/locations/:id', function() {

  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      tu.patch('/v1/locations/2', { businessId:2, name:'Barhouse2', lat:10.0015, lon:10.0015 }, function(err, results, res) {
        assert(!err);
        assert(res.statusCode == 200);
        tu.logout(done);
      });
    });
  });

  it('should respond to an invalid payload with errors', function(done) {
    tu.loginAsSales(function(error, user){
      tu.patch('/v1/locations/2', { lat:'foobar' }, function(err, results, res) {

        assert(!err);
        assert(res.statusCode == 400);

        tu.logout(done);
      });
    });
  });

});


describe('DELETE /v1/locations/:id', function() {
  it('should respond with a 200', function(done) {
    tu.loginAsSales(function(error, user){
      tu.del('/v1/locations/5', function(err, results, res) {
        assert(!err);
        assert(res.statusCode == 200);
        tu.logout(done);
      });
    });
  });

});