var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
;

describe('GET /v1/locations', function() {

  it('should respond with a location listing of all enabled locations', function(done) {
    tu.get('/v1/locations', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length > 1);
      assert(payload.data[0].id == 1);
      assert(payload.data[0].businessId == 1);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.data[0].isEnabled == null || payload.data[0].isEnabled == undefined);
      assert(payload.meta.total > 1);
      done();
    });
  });

  it('should respond with a location listing regardless of enabled state', function(done) {
    tu.loginAsAdmin(function(error){
      assert(!error);
      tu.get('/v1/locations?all=true', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);

        assert(!payload.error);

        assert(payload.data[0].isEnabled != null && payload.data[0].isEnabled != undefined);

        assert(payload.meta.total > 1);
        tu.logout(done);
      });
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

  it('should filter by lat/lon/range', function(done) {
    tu.get('/v1/locations?lat=10&lon=10&range=1000', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length === 2);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.data[1].name == 'Location 2');
      assert(payload.meta.total > 1);

      tu.get('/v1/locations?lat=10&lon=10&range=100', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.length === 1);
        assert(payload.data[0].name == 'Location 1');
        done();
      });
    });
  });

  it('should filter by a single tag', function(done) {
    tu.get('/v1/locations?tag=uniquetag', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length == 1);
      done();
    });
  });

  it('should filter by mutliple tags', function(done) {
    tu.get('/v1/locations?tag[]=food&tag[]=apparel', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length == 3);
      done();
    });
  });

  it('should sort ASC if no prefix is given', function(done) {
    tu.get('/v1/locations?sort=name', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.data[1].name == 'Location 2');
      done();
    });
  });

  it('should sort DESC if a - prefix is given', function(done) {
    tu.get('/v1/locations?sort=-name', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data[0].name == 'Location 6');
      done();
    });
  });

  it('should sort by random', function(done) {
    tu.get('/v1/locations?sort=random', function(err, payload, res) {
      assert(!err);
      assert(res.statusCode == 200);
      done();
    });
  });

  it('should sort by distance if also given a location', function(done) {
    tu.get('/v1/locations?lat=10&lon=10&sort=distance', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data[0].name == 'Location 1');
      assert(payload.data[1].name == 'Location 2');
      done();
    });
  });

  it('should return 400 if asked to sort by distance and not given a location', function(done) {
    tu.get('/v1/locations?sort=distance', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 400);
      done();
    });
  });

  it('should return 400 if the sort parameter is not recognized', function(done) {
    tu.get('/v1/locations?sort=foobar', function(err, payload, res) {

      assert(!err);
      assert(res.statusCode == 400);
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
      assert(res.statusCode == 400);
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

describe('GET /v1/locations/food', function() {
  it('should respond with food items', function(done) {
    tu.get('/v1/locations/food?include=tags', function(err, payload, res) {

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

  it('should filter lat/lon', function(done) {
    tu.get('/v1/locations/food?include=tags&lat=37.332409&lon=-122.0305121', function(err, payload, res) {
      assert(res.statusCode == 200);
      done();
    });
  });

  it('should not allow the user to filter by tags', function(done) {
    tu.get('/v1/locations/food?tag=foobar&include=tags', function(err, payload, res) {
      assert(res.statusCode == 400);
      done();
    });
  });
});

describe('GET /v1/locations/fashion', function() {
  it('should respond with fashion items', function(done) {
    tu.get('/v1/locations/fashion?include=tags', function(err, payload, res) {

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
});

describe('GET /v1/locations/other', function() {
  it('should respond with non-food and non-fashion items', function(done) {
    tu.get('/v1/locations/other?include=tags', function(err, payload, res) {

      assert(!err);
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

  it('should let sales see keytag info', function(done) {
    tu.loginAsSales(function(){
      tu.get('/v1/locations/1/key-tag-requests', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);

        assert(!payload.error);
        assert(payload.data.lastKeyTagRequest);
        assert(payload.data.keyTagRequestPending);

        tu.logout(done);
      });
    });
  });

  it('should let managers see keytag info', function(done) {
    tu.login({email: 'some_manager@gmail.com', password: 'password'}, function(error, user){
      assert(!error);
      tu.get('/v1/locations/1/key-tag-requests', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);

        assert(!payload.error);
        assert(payload.data.lastKeyTagRequest);
        assert(payload.data.keyTagRequestPending);

        tu.logout(done);
      });
    });
  });

  it('should not let consumers see keytag info', function(done) {
    tu.login({email: 'some_manager@gmail.com', password: 'password'}, function(error, user){
      assert(!error);
      tu.get('/v1/locations/1/key-tag-requests', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);

        assert(!payload.error);
        assert(payload.data.lastKeyTagRequest);
        assert(payload.data.keyTagRequestPending);

        tu.logout(done);
      });
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
        // All day
        startMonday:'00:00',
        endMonday:'24:00',
        // Closed
        startTuesday:'00:00',
        endTuesday:'00:00',
        startWednesday:'11:00 am',
        endWednesday:'5:00 pm',
        startThursday:'11:00 AM',
        endThursday:'5:00 pm',
        startFriday:'11:00 am',
        endFriday:'0430'
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
      tu.post('/v1/locations', { businessId:null, name:'a', street1:'', city:'', state:'', zip:'', country:'' }, function(err, results, res) {
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


describe('GET /v1/locations/:id/analytics', function() {

  it('should respond with a locations stats', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/locations/1/analytics', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(!payload.error);
        assert(payload.data.day.likes == 1);
        assert(payload.data.day.wants == 1);
        assert(payload.data.day.tries == 1);
        assert(payload.data.day.tapins == 1);
        assert(payload.data.day.punches == 4);
        assert(payload.data.day.redemptions == 1);
        assert(payload.data.day.visits == 1);
        assert(payload.data.day.firstVisits == 0);
        assert(payload.data.day.returnVisits == 1);
        assert(payload.data.day.becameElites == 1);
        assert(payload.data.day.photos == 1);
        assert(payload.data.week.likes == 2);
        assert(payload.data.week.wants == 2);
        assert(payload.data.week.tries == 2);
        assert(payload.data.week.tapins == 2);
        assert(payload.data.week.punches == 8);
        assert(payload.data.week.redemptions == 2);
        assert(payload.data.week.visits == 2);
        assert(payload.data.week.firstVisits == 0);
        assert(payload.data.week.returnVisits == 2);
        assert(payload.data.week.becameElites == 2);
        assert(payload.data.week.photos == 1);
        assert(payload.data.month.likes == 3);
        assert(payload.data.month.wants == 3);
        assert(payload.data.month.tries == 3);
        assert(payload.data.month.tapins == 3);
        assert(payload.data.month.punches == 12);
        assert(payload.data.month.redemptions == 3);
        assert(payload.data.month.visits == 3);
        assert(payload.data.month.firstVisits == 0);
        assert(payload.data.month.returnVisits == 3);
        assert(payload.data.month.becameElites == 3);
        assert(payload.data.month.photos == 1);
        assert(payload.data.all.likes == 4);
        assert(payload.data.all.wants == 4);
        assert(payload.data.all.tries == 4);
        assert(payload.data.all.tapins == 4);
        assert(payload.data.all.punches == 16);
        assert(payload.data.all.redemptions == 4);
        assert(payload.data.all.visits == 4);
        assert(payload.data.all.firstVisits == 1);
        assert(payload.data.all.returnVisits == 3);
        assert(payload.data.all.becameElites == 4);
        assert(payload.data.all.photos == 1);
        tu.logout(done);
      });
    });
  });

  it('should respond 404 with invalid location id', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/locations/100/analytics', function(error, results, res) {
        assert(!error);
        assert(res.statusCode == 404);
        tu.logout(done);
      });
    });
  });

  it('should respond 404 with invalid location id type', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/locations/abcd/analytics', function(error, results, res) {
        assert(!error);
        assert(res.statusCode == 404);
        tu.logout(done);
      });
    });
  });
});

describe('/v1/locations/:id/products', function() {

  it('should add and remove products from a location', function(done) {
    tu.loginAsAdmin(function(error, user){
      tu.del('/v1/locations/1/products/1', function(err, results, res) {
        assert(res.statusCode == 200);

        tu.get('/v1/locations/1/products', function(err, results, res) {
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.filter(function(product) {
            return product.id === 1;
          }).length === 0);

          tu.post('/v1/locations/1/products', { productId:1, isSpotlight:false }, function(err, results, res) {
            assert(res.statusCode == 200);
            tu.logout(done);
          });
        });
      });
    });
  });

  it('should update the product location', function(done) {
    tu.loginAsAdmin(function(error, user){
      tu.put('/v1/locations/1/products/1', {isSpotlight:true}, function(err, results, res) {
        assert(res.statusCode == 200);
        tu.logout(done);
      });
    });
  });
});

describe('POST /v1/locations/:locationsId/key-tag-requests', function() {
  it('should put in a request for key tags', function(done){
    tu.login({email: 'some_manager@gmail.com', password: 'password'}, function(error, user){
      assert(!error);
      tu.get('/v1/locations/1/key-tag-requests', function(err, payload, res) {

        assert(!err);
        assert(res.statusCode == 200);

        payload = JSON.parse(payload);

        assert(!payload.error);
        assert(payload.data.lastKeyTagRequest);
        assert(payload.data.keyTagRequestPending);

        tu.logout(done);
      });
    });
  });
});