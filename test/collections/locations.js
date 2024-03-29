var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
, ok = require('okay')
, _ = require('lodash')
;

describe('GET /v1/locations', function() {

  it('should respond with a location listing of all enabled locations', function(done) {
    tu.populate('businesses', [{ name:'Business 1', logoUrl: 'http://poop.bu.tt/1.jpg' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }, { name:'Location 2', businessId:bids[0], isEnabled:false }], function() {
        tu.get('/v1/locations', function(err, payload, res) {
          assert(res.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.meta.total > 1);
          assert(payload.data.filter(function(l){ return l.logoUrl == 'http://poop.bu.tt/1.jpg'; }).length > 0);
          assert(tu.arrHas(payload.data, 'isEnabled', false) === false);
          done();
        });
      });
    });
  });

  it('should respond with a location listing regardless of enabled state', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }, { name:'Disabled', businessId:bids[0], isEnabled:false }], function() {
        tu.loginAsAdmin(function(error){
          assert(!error);
          tu.get('/v1/locations?all=true', function(err, payload, res) {
            assert(res.statusCode == 200);
            payload = JSON.parse(payload);
            assert(tu.arrHas(payload.data, 'name', 'Disabled'));
            assert(payload.meta.total > 1);
            tu.logout(done);
          });
        });
      });
    });
  });

  it('should paginate', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }, { name:'Location 2', businessId:bids[0], isEnabled:true }], function() {
        tu.get('/v1/locations?offset=1&limit=1', function(err, payload, res) {

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
  });

  it('should filter by lat/lon/range', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'First', businessId:bids[0], lat:8, lon:8, isEnabled:true }, { name:'Second', businessId:bids[0], lat:8.001, lon:8.001, isEnabled:true }], function() {
        tu.get('/v1/locations?lat=8&lon=8&range=1000&sort=distance', function(err, payload, res) {
          assert(res.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data.length === 2);
          assert(payload.data[0].name == 'First');
          assert(payload.data[1].name == 'Second');
          assert(payload.meta.total > 1);

          tu.get('/v1/locations?lat=8&lon=8&range=100&sort=distance', function(err, payload, res) {
            assert(res.statusCode == 200);
            payload = JSON.parse(payload);
            assert(payload.data.length === 1);
            assert(payload.data[0].name == 'First');
            done();
          });
        });
      });
    });
  });

  it('should filter by a single tag', function(done) {
    tu.populate('businesses', [{ name:'Business 1', tags:['uniqueloctag'] }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }, { name:'Location 2', businessId:bids[0], isEnabled:true }], function() {
        tu.get('/v1/locations?tag=uniqueloctag', function(err, payload, res) {
          assert(res.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data.length == 2);
          done();
        });
      });
    });
  });

  it('should filter by mutliple tags', function(done) {
    tu.populate('businesses', [{ name:'Business 1', tags:['uniqueloctag1'] }, { name:'Business 2', tags:['uniqueloctag2'] }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }, { name:'Location 2', businessId:bids[1], isEnabled:true }], function() {
        tu.get('/v1/locations?tag[]=uniqueloctag1&tag[]=uniqueloctag2', function(err, payload, res) {
          assert(res.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data.length == 2);
          done();
        });
      });
    });
  });

  it('should sort ASC if no prefix is given', function(done) {
    tu.get('/v1/locations?sort=name', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      for (var i=0; i < payload.data.length - 1; i++)
        assert(payload.data[i].name <= payload.data[i+1].name);
      done();
    });
  });

  it('should sort DESC if a - prefix is given', function(done) {
    tu.get('/v1/locations?sort=-name', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      for (var i=0; i < payload.data.length - 1; i++)
        assert(payload.data[i].name >= payload.data[i+1].name);
      done();
    });
  });

  it('should sort by random', function(done) {
    tu.get('/v1/locations?sort=random', function(err, payload, res) {
      assert(res.statusCode == 200);
      done();
    });
  });

  it('should show hours even if not logged in', function(done) {
    tu.get('/v1/locations', function(err, payload, res) {
      assert(res.statusCode == 200);

      payload = JSON.parse(payload);

      payload.data.forEach(function(location){
        [
          'Monday'
        , 'Tuesday'
        , 'Wednesday'
        , 'Thursday'
        , 'Friday'
        , 'Saturday'
        , 'Sunday'
        ].forEach(function(day){
          assert(('start' + day) in location);
          assert(('end' + day) in location);
        });
      });

      done();
    });
  });

  it('should sort by distance if also given a location', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'First', businessId:bids[0], lat:5, lon:5, isEnabled:true }, { name:'Second', businessId:bids[0], lat:5.001, lon:5.001, isEnabled:true }], function() {
        tu.get('/v1/locations?lat=5&lon=5&sort=distance', function(err, payload, res) {
          assert(res.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data[0].name == 'First');
          assert(payload.data[1].name == 'Second');
          done();
        });
      });
    });
  });

  it('should return 400 if asked to sort by distance and not given a location', function(done) {
    tu.get('/v1/locations?sort=distance', function(err, payload, res) {
      assert(res.statusCode == 400);
      done();
    });
  });

  it('should return 400 if the sort parameter is not recognized', function(done) {
    tu.get('/v1/locations?sort=foobar', function(err, payload, res) {
      assert(res.statusCode == 400);
      done();
    });
  });

});


describe('GET /v1/businesses/:id/locations', function() {

  it('should respond with a location listing', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }, { name:'Location 2', businessId:bids[0], isEnabled:true }], function() {
        tu.get('/v1/businesses/'+bids[0]+'/locations', function(err, payload, res) {
          assert(res.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data.length  == 2);
          assert(payload.meta.total > 1);
          done();
        });
      });
    });
  });

  it('should respond 404 to invalid business id', function(done) {
    tu.get('/v1/businesses/100/locations', function(error, results, res) {
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should respond 400 to invalid business id type', function(done) {
    tu.get('/v1/businesses/abcd/locations', function(error, results, res) {
      assert(res.statusCode == 400);
      done();
    });
  });

  it('should paginate', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }, { name:'Location 2', businessId:bids[0], isEnabled:true }], function() {
        tu.get('/v1/businesses/'+bids[0]+'/locations?offset=1&limit=1', function(err, payload, res) {

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
  });
});

describe('GET /v1/locations/food', function() {
  it('should respond with food items', function(done) {
    tu.populate('businesses', [{ name:'Business 1', tags:['food'] }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }, { name:'Location 2', businessId:bids[0], isEnabled:true }], function() {
        tu.get('/v1/locations/food?include=tags', function(err, payload, res) {
          assert(res.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data.length > 0);
          assert(payload.data.filter(function(p) {
            return (p.tags.indexOf('food') === -1);
          }).length === 0); // make sure all rows have the 'food' tag
          done();
        });
      });
    });
  });

  it('should filter lat/lon', function(done) {
    tu.get('/v1/locations/food?include=tags&lat=37.332409&lon=-122.0305121', function(err, payload, res) {
      assert(res.statusCode == 200);
      done();
    });
  });

});

describe('GET /v1/locations/fashion', function() {
  it('should respond with fashion items', function(done) {
    tu.populate('businesses', [{ name:'Business 1', tags:['apparel'] }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }, { name:'Location 2', businessId:bids[0], isEnabled:true }], function() {
        tu.get('/v1/locations/fashion?include=tags', function(err, payload, res) {
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
  });
});

describe('GET /v1/locations/other', function() {
  it('should respond with non-food and non-fashion items', function(done) {
    tu.populate('businesses', [{ name:'Business 1', tags:['foobar'] }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }, { name:'Location 2', businessId:bids[0], isEnabled:true }], function() {
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
  });
});

describe('GET /v1/locations/:id', function() {

  it('should respond with a location', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.get('/v1/locations/'+lids[0], function(err, payload, res) {
          assert(res.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data.id == lids[0]);
          assert(payload.data.businessId == bids[0]);
          assert(payload.data.name == 'Location 1');
          done();
        });
      });
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
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.loginAsAdmin(function() {
          tu.post('/v1/locations/'+lids[0]+'/key-tag-requests', {}, function(err, results, res) {
            assert(res.statusCode == 204);
            tu.logout(function() {
              tu.loginAsSales(function(){
                tu.get('/v1/locations/'+lids[0], function(err, payload, res) {
                  assert(res.statusCode == 200);
                  payload = JSON.parse(payload);
                  assert(payload.data.lastKeyTagRequest);
                  assert(payload.data.keyTagRequestPending);
                  tu.logout(done);
                });
              });
            });
          });
        });
      });
    });
  });

  it('should let managers see keytag info', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.populate('managers', [{ email:'managerkeytags@gmail.com', password:'password', businessId:bids[0], locationId:lids[0] }], function() {
          tu.loginAsAdmin(function() {
            tu.post('/v1/locations/'+lids[0]+'/key-tag-requests', {}, function(err, results, res) {
              assert(res.statusCode == 204);
              tu.logout(function() {
                tu.login({email: 'managerkeytags@gmail.com', password: 'password'}, function(error, user){
                  assert(!error);
                  tu.get('/v1/locations/'+lids[0], function(err, payload, res) {
                    assert(res.statusCode == 200);
                    payload = JSON.parse(payload);
                    assert(payload.data.lastKeyTagRequest);
                    assert(payload.data.keyTagRequestPending);
                    tu.logout(done);
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('should not let consumers see keytag info', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.loginAsAdmin(function() {
          tu.post('/v1/locations/'+lids[0]+'/key-tag-requests', {}, function(err, results, res) {
            assert(res.statusCode == 204);
            tu.logout(function() {
              tu.login({email: 'tferguson@gmail.com', password: 'password'}, function(error, user){
                assert(!error);
                tu.get('/v1/locations/'+lids[0], function(err, payload, res) {
                  assert(res.statusCode == 200);
                  payload = JSON.parse(payload);
                  assert(typeof payload.data.lastKeyTagRequest == 'undefined');
                  assert(typeof payload.data.keyTagRequestPending == 'undefined');
                  tu.logout(done);
                });
              });
            });
          });
        });
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

  it('should respond with the id of a new location with different time formats', function(done) {
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
        endTuesday:'13:00',
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

  it('should respond with a 204', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.loginAsSales(function(error, user){
          tu.patch('/v1/locations/'+lids[0], { businessId:2, name:'Barhouse2', lat:10.0015, lon:10.0015 }, function(err, results, res) {
            assert(res.statusCode == 204);
            tu.logout(done);
          });
        });
      });
    });
  });

  it('can be modified by manager for entire business', function(done) {
    tu.populate('businesses', [{ name:'Business blah' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location bla', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.populate('managers', [{ email:'all-biz-manager2@gmail.com', password:'password', businessId:bids[0]  }], function() {
          tu.logout(ok(done, function() {
            var user = {email: 'all-biz-manager2@gmail.com', password: 'password'}
            tu.login(user, ok(done, function() {
              tu.patch('/v1/locations/' + lids[0], {name: 'zoom'}, ok(done, function(result, res) {
                assert(res.statusCode === 204);
                tu.logout(done);
              }));
            }));
          }))
        });
      });
    });
  });


  it('should respond to a locations key tag request', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.loginAsAdmin(function() {
          tu.post('/v1/locations/'+lids[0]+'/key-tag-requests', {}, function(err, results, res) {
            assert(res.statusCode == 204);
            tu.logout(function() {
              tu.loginAsSales(function(error, user){
                tu.patch('/v1/locations/'+lids[0], { keyTagRequestPending: false }, function(err, results, res) {
                  assert(!err);
                  assert(res.statusCode == 204);

                  tu.get('/v1/locations/'+lids[0], function(error, results, res){
                    assert(res.statusCode == 200);
                    results = JSON.parse(results);
                    assert(results.data.keyTagRequestPending === false);
                    tu.logout(done);
                  });
                });
              });
            });
          });
        });
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
  it('should respond with a 204', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.loginAsSales(function(error, user){
          tu.del('/v1/locations/'+lids[0], function(err, results, res) {
            assert(res.statusCode == 204);
            tu.logout(done);
          });
        });
      });
    });
  });
});


describe('GET /v1/locations/:id/analytics', function() {

  it('should respond with a locations stats', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.loginAsAdmin(function() {
          tu.get('/v1/locations/'+lids[0]+'/analytics', function(err, payload, res) {
            assert(res.statusCode == 200);
            payload = JSON.parse(payload);
            assert(!payload.error);
            assert(typeof payload.data.day.likes != 'undefined');
            assert(typeof payload.data.day.wants != 'undefined');
            assert(typeof payload.data.day.tries != 'undefined');
            assert(typeof payload.data.day.tapins != 'undefined');
            assert(typeof payload.data.day.punches != 'undefined');
            assert(typeof payload.data.day.redemptions != 'undefined');
            assert(typeof payload.data.day.visits != 'undefined');
            assert(typeof payload.data.day.firstVisits != 'undefined');
            assert(typeof payload.data.day.returnVisits != 'undefined');
            assert(typeof payload.data.day.becameElites != 'undefined');
            assert(typeof payload.data.day.photos != 'undefined');
            assert(typeof payload.data.week.likes != 'undefined');
            assert(typeof payload.data.week.wants != 'undefined');
            assert(typeof payload.data.week.tries != 'undefined');
            assert(typeof payload.data.week.tapins != 'undefined');
            assert(typeof payload.data.week.punches != 'undefined');
            assert(typeof payload.data.week.redemptions != 'undefined');
            assert(typeof payload.data.week.visits != 'undefined');
            assert(typeof payload.data.week.firstVisits != 'undefined');
            assert(typeof payload.data.week.returnVisits != 'undefined');
            assert(typeof payload.data.week.becameElites != 'undefined');
            assert(typeof payload.data.week.photos != 'undefined');
            assert(typeof payload.data.month.likes != 'undefined');
            assert(typeof payload.data.month.wants != 'undefined');
            assert(typeof payload.data.month.tries != 'undefined');
            assert(typeof payload.data.month.tapins != 'undefined');
            assert(typeof payload.data.month.punches != 'undefined');
            assert(typeof payload.data.month.redemptions != 'undefined');
            assert(typeof payload.data.month.visits != 'undefined');
            assert(typeof payload.data.month.firstVisits != 'undefined');
            assert(typeof payload.data.month.returnVisits != 'undefined');
            assert(typeof payload.data.month.becameElites != 'undefined');
            assert(typeof payload.data.month.photos != 'undefined');
            assert(typeof payload.data.all.likes != 'undefined');
            assert(typeof payload.data.all.wants != 'undefined');
            assert(typeof payload.data.all.tries != 'undefined');
            assert(typeof payload.data.all.tapins != 'undefined');
            assert(typeof payload.data.all.punches != 'undefined');
            assert(typeof payload.data.all.redemptions != 'undefined');
            assert(typeof payload.data.all.visits != 'undefined');
            assert(typeof payload.data.all.firstVisits != 'undefined');
            assert(typeof payload.data.all.returnVisits != 'undefined');
            assert(typeof payload.data.all.becameElites != 'undefined');
            assert(typeof payload.data.all.photos != 'undefined');
            tu.logout(done);
          });
        });
      });
    });
  });

  it('should respond with empty data on invalid location id', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/locations/100/analytics', function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.day);
        assert(!results.data.day.likes);
        tu.logout(done);
      });
    });
  });
});

describe('/v1/locations/:id/products', function() {

  describe('spotlight information', function() {
    var checkSpotlightInfo = function(info, cb) {
      tu.get('/v1/locations/1/products?spotlight=true', ok(cb, function(result, res) {
        var data = JSON.parse(result).data;
        var product = _.find(data, {id: 1});
        assert(product);
        assert(product.inSpotlight === info.inSpotlight);
        assert(product.inGallery === info.inGallery);
        assert(product.spotlightOrder === info.spotlightOrder);
        assert(product.galleryOrder === info.galleryOrder);
        cb();
      }));
    };

    it('should be able to read spotlight & gallery information', function(done) {
      tu.loginAsAdmin(ok(done, function() {
        var expected = {
          inSpotlight: true,
          inGallery: true,
          spotlightOrder: 1,
          galleryOrder: 2
        };
        checkSpotlightInfo(expected, ok(done, function() {
          tu.logout(done);
        }));
      }));
    });

    it('should be able to update spotlight & gallery information', function(done) {
      tu.loginAsAdmin(ok(done, function() {
        var body = {
          inSpotlight: false,
          inGallery: true,
          spotlightOrder: 2,
          galleryOrder: 3
        };
        tu.put('/v1/locations/1/products/1', body, ok(done, function(result, res) {
          assert(res.statusCode, 204);
          checkSpotlightInfo(body, ok(done, function() {
            tu.logout(done);
          }));
        }))
      }));
    });

  });

  it('should add and remove products from a location', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.populate('products', [{ name:'Product 1', businessId:bids[0], isEnabled:true }], function(err, pids) {
          tu.loginAsAdmin(function(error, user){
            tu.post('/v1/locations/'+lids[0]+'/products', { productId:pids[0], inSpotlight:false }, function(err, results, res) {
              assert(res.statusCode == 204);

              tu.get('/v1/locations/'+lids[0]+'/products', function(err, results, res) {
                assert(res.statusCode == 200);
                results = JSON.parse(results);
                assert(results.data.filter(function(product) {
                  return product.id === pids[0];
                }).length === 1);

                tu.del('/v1/locations/'+lids[0]+'/products/'+pids[0], function(err, results, res) {
                  assert(res.statusCode == 204);
                  tu.logout(done);
                });
              });
            });
          });
        });
      });
    });
  });

  it('should update the product location', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.populate('products', [{ name:'Product 1', businessId:bids[0], isEnabled:true }], function(err, pids) {
          tu.loginAsAdmin(function(error, user){
            tu.post('/v1/locations/'+lids[0]+'/products', { productId:pids[0], inSpotlight:false }, function(err, results, res) {
              assert(res.statusCode == 204);
              tu.put('/v1/locations/'+lids[0]+'/products/'+pids[0], {inSpotlight:true}, function(err, results, res) {
                assert(res.statusCode == 204);
                tu.logout(done);
              });
            });
          });
        });
      });
    });
  });

  it('should add products to productLocations when a new location is added', function(done){

    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.populate('products', [{ name:'Product 1', businessId:bids[0], isEnabled:true }], function(err, pids) {

          tu.loginAsAdmin(function(error,user){
            tu.post('/v1/locations', { name: 'Location 2', businessId: bids[0], isEnabled: true }, function(error, results, res){
              assert(res.statusCode == 200);

              results = JSON.parse(results);

              assert(!results.error);
              var lid = results.data.id;
              assert(lid);

              tu.get('/v1/locations/' + lid + '/products', function(error, results, res){
                assert(res.statusCode == 200);
                results = JSON.parse(results);
                assert(!results.error);

                assert(results.data.length == 1);
                assert(results.data[0].id == pids[0]);

                tu.logout(done);
              });

            });
          });

        });
      });
    });
  });

  it('should list products when specifying a locationId even if the business is unverified', function(done){

    var data = [{ name: 'My Little Bidness', isVerified: false }];
    tu.populate('businesses', data, function(error, businesses){
      assert(!error);

      var bid = businesses[0];
      data = [{ name: 'My Little Location', businessId: bid, isEnabled: true }];
      tu.populate('locations', data, function(error, locations){
        assert(!error);

        var lid = locations[0];
        data = [{ name: 'My Little Product', businessId: bid }];
        tu.populate('products', data, function(error, products){
          assert(!error);

          tu.get('/v1/locations/' + lid + '/products', function(error, results, res){
            assert(!error);

            assert(res.statusCode == 200);

            results = JSON.parse(results);
            assert(results.data.length == 1);
            done();
          });
        });
      });
    });
  });
});

describe('POST /v1/locations/:locationsId/key-tag-requests', function() {
  it('should put in a request for key tags', function(done){
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.populate('managers', [{ email:'managerkeytags2@gmail.com', password:'password', businessId:bids[0], locationId:lids[0] }], function() {
          tu.login({email: 'managerkeytags2@gmail.com', password: 'password'}, function(error, user){
            assert(!error);
            var current = new Date();
            tu.post('/v1/locations/'+lids[0]+'/key-tag-requests', {}, function(err, payload, res) {
              assert(res.statusCode == 204);

              tu.get('/v1/locations/'+lids[0], function(err, payload, res){
                assert(!err);
                assert(res.statusCode == 200);

                payload = JSON.parse(payload);

                assert(!payload.error);
                assert(new Date(payload.data.lastKeyTagRequest) >= current);
                assert(payload.data.keyTagRequestPending === true);

                tu.logout(done);
              });
            });
          });
        });
      });
    });
  });
});

describe('GET /v1/locations/:locationsId/measures', function() {

  it('can be fetched by manager for entire business', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0], isEnabled:true }], function(err, lids) {
        tu.populate('managers', [{ email:'all-biz-manager@gmail.com', password:'password', businessId:bids[0]  }], function() {
          tu.logout(ok(done, function() {
            var user = {email: 'all-biz-manager@gmail.com', password: 'password'}
            tu.login(user, ok(done, function() {
              tu.get('/v1/locations/' + lids[0] + '/measures', ok(done, function(result, res) {
                assert(res.statusCode === 200);
                tu.logout(done);
              }));
            }));
          }))
        });
      });
    });
  });

  it('can be fetched by location manager', function(done) {
    tu.login({email: 'some_manager@gmail.com', password: 'password'}, ok(done, function() {
      tu.get('/v1/locations/1/measures', ok(done, function(result, res) {
        assert(res.statusCode === 200);
        var data = JSON.parse(result).data;
        assert(data.totalUsers === 0);
        assert(data.totalLikes === 1);
        assert(data.totalPunches === 0);
        tu.logout(done);
      }));
    }));
  });

  it('cannot be fetch by non-owner', function(done) {
    var user = { email: 'manager_redeem3@gmail.com', password: 'password' };
    tu.logout(ok(done, function() {
      tu.login(user, ok(done, function() {
        tu.get('/v1/locations/1/measures', ok(function(results, res) {
          assert(res.statusCode === 403);
          tu.logout(done);
        }));
      }));
    }));
  });
});
