var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
, perms   = require('../../collections/businesses/permissions')
, ok      = require('okay')
;

describe('GET /v1/businesses', function() {
  it('should respond with a business listing of all verified businesses', function(done) {
    var data = [{ name:'Business 1' }, { name:'Business UNVERIFIED', isVerified: false }];
    tu.populate('businesses', data, function(err, ids) {
      tu.get('/v1/businesses', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data[0].id);
        assert(payload.data[0].name.length > 0);
        // Filter by isVerified not true - should be 0
        assert(payload.data.filter(function(a){ return a.name == 'Business UNVERIFIED'; }).length === 0);
        tu.depopulate('businesses', ids, done);
      });
    });
  });
  it('should filter', function(done) {
    tu.populate('businesses', [{ name:'Business X' }], function(err, ids) {
      tu.get('/v1/businesses?filter=X', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.length === 1);
        assert(payload.data[0].name == 'Business X');
        tu.depopulate('businesses', ids, done);
      });
    });
  });
  it('should filter', function(done) {
    tu.populate('businesses', [{ name:'Business X' }, { name:'Business Y' }], function(err, ids) {
      tu.get('/v1/businesses?filter=bus', function(err, results, res) {
        assert(res.statusCode === 200);
        var payload = JSON.parse(results);
        assert(tu.arrHas(payload.data, 'name', 'Business X'));
        assert(tu.arrHas(payload.data, 'name', 'Business Y'));
        tu.depopulate('businesses', ids, done);
      });
    });
  });

  it('should filter by a single tag', function(done) {
    tu.populate('businesses', [{ name:'Business 1', tags:['myuniquetag', 'foobar'] }, { name:'Business 2', tags:['foobar'] }], function(err, ids) {
      tu.get('/v1/businesses?tag=myuniquetag', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.length == 1);
        tu.depopulate('businesses', ids, done);
      });
    });
  });

  it('should filter by mutliple tags', function(done) {
    tu.populate('businesses', [{ name:'Business X', tags:['food'] }, { name:'Business Y', tags:['apparel'] }], function(err, ids) {
      tu.get('/v1/businesses?tag[]=food&tag[]=apparel', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(tu.arrHas(payload.data, 'name', 'Business X'));
        assert(tu.arrHas(payload.data, 'name', 'Business Y'));
        tu.depopulate('businesses', ids, done);
      });
    });
  });

  it('should filter by isVerified', function(done) {
    tu.get('/v1/businesses?isVerified=true', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length == 6);
      tu.get('/v1/businesses?isVerified=false', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.length == 1);
        done();
      });
    });
  });

  it('should not filter by isVerified', function(done) {
    tu.get('/v1/businesses?isVerified[]=true&isVerified[]=false', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.length == 7);
      done();
    });
  });

  it('should filter by isGB', function(done) {
    tu.get('/v1/businesses?isGB=true', function(err, payload, res) {
      assert(res.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data[0].isGB == true);
      tu.get('/v1/businesses?isGB=false', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(!payload.data[0].isGB);
        done();
      });
    });
  });

  it('should paginate', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }, { name:'Business 2' }], function(err, ids) {
      tu.get('/v1/businesses?offset=1&limit=1', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.length === 1);
        assert(payload.data[0].name.length > 0);
        assert(payload.meta.total > 1);
        tu.depopulate('businesses', ids, done);
      });
    });
  });

  it('should include locations on include=locations', function(done) {
    tu.populate('businesses', [{ name:'Locinclude 1' }, { name:'Locinclude 2' }], function(err, bids) {
      tu.populate('locations', [{ name:'Location 1', businessId:bids[0] }, { name:'Location 2', businessId:bids[1] }], function(err, lids) {
        tu.get('/v1/businesses?filter=locinclude&include=locations', function(err, results, res) {
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data[0].locations[0].name == 'Location 1');
          assert(results.data[1].locations[0].name == 'Location 2');
          tu.depopulate('locations', lids, function() {
            tu.depopulate('businesses', bids, done);
          });
        });
      });
    });
  });
});

describe('GET /v1/businesses/requests', function() {
  it('should respond with a list of business requests', function(done) {
    tu.loginAsAdmin(function(){
      tu.get('/v1/businesses/requests', function(error, results){
        assert(!error);
        results = JSON.parse(results);
        assert(results.data.length > 0);
        tu.logout(done);
      });
    });
  });

  it('should respond with a 403', function(done) {
    tu.get('/v1/businesses/requests', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 401);
      done()
    });
  });
});

describe('POST /v1/businesses/requests', function() {
  it('should save a business request', function(done) {
    tu.post('/v1/businesses/requests', { name: 'Testerrroooo' }, function(error, results, res){
      assert(!error);
      assert(res.statusCode == 204);
      tu.logout(done);
    });
  });
});

describe('GET /v1/businesses/food', function() {
  it('should respond with food items', function(done) {
    tu.populate('businesses', [{ name:'Business 1', tags:['food'] }, { name:'Business 2', tags:['apparel'] }], function(err, ids) {
      tu.get('/v1/businesses/food?include=tags', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.length > 0);
        assert(payload.data.filter(function(p) {
          return (p.tags.indexOf('food') === -1);
        }).length === 0); // make sure all rows have the 'food' tag
        tu.depopulate('businesses', ids, done);
      });
    });
  });
});

describe('GET /v1/businesses/fashion', function() {
  it('should respond with fashion items', function(done) {
    tu.populate('businesses', [{ name:'Business 1', tags:['food'] }, { name:'Business 2', tags:['apparel'] }], function(err, ids) {
      tu.get('/v1/businesses/fashion?include=tags', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.length > 0);
        assert(payload.data.filter(function(p) {
          return (p.tags.indexOf('apparel') === -1);
        }).length === 0); // make sure all rows have the 'apparel' tag
        tu.depopulate('businesses', ids, done);
      });
    });
  });
});

describe('GET /v1/businesses/other', function() {
  it('should respond with non-food and non-fashion items', function(done) {
    tu.populate('businesses', [{ name:'Business 1', tags:['food'] }, { name:'Business 2', tags:['apparel', 'foobar'] }, { name:'Business 3', tags:['foobar'] }], function(err, ids) {
      tu.get('/v1/businesses/other?include=tags', function(err, payload, res) {
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        assert(payload.data.length > 0);
        assert(payload.data.filter(function(p) {
          return (p.tags.indexOf('food') !== -1 || p.tags.indexOf('apparel') !== -1);
        }).length === 0); // make sure no rows have the 'food' or 'apparel' tag
        tu.depopulate('businesses', ids, done);
      });
    });
  });
});

describe('GET /v1/businesses/:id', function() {
  it('should respond with a single business document', function(done) {
    tu.populate('businesses', [{ name:'Business 1', tags:['food'] }], function(err, ids) {
      tu.get('/v1/businesses/' + ids[0], function(err, results, res) {
        var payload = JSON.parse(results);
        assert(payload.data.id === ids[0]);
        tu.depopulate('businesses', ids, done);
      });
    });
  });

  it('should return 404 if the id is not in the database', function(done){
    tu.get('/v1/businesses/5', function(error, results, res){
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should return 404 if the id is not in correct type', function(done){
    tu.get('/v1/businesses/asdf', function(error, results, res){
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should respond with a single business document with fields ' + perms.business.world.read.join(', '), function(done) {
    tu.populate('businesses', [{
        name: 'Business 1',
        url: 'foobar.com',
        logoUrl: 'foobar.com/logo.png',
        cardCode: '123456-ABC',
        menuDescription: 'foobar',
        street1: 'asdf',
        street2: 'asdf',
        city: 'asdf',
        state: 'TX',
        zip: 12345,
        tags:['food'],
        isGB: false,
        isVerified: true
      }], function(err, ids) {
      tu.get('/v1/businesses/' + ids[0], function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.id === ids[0]);

        for (var key in payload.data){
          assert(perms.business.world.read.indexOf(key) > -1);
        }

        tu.depopulate('businesses', ids, done);
      });
    });
  });

  it('should respond with a businesses loyalty settings', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, ids) {
      var loyalty = {
          requiredItem: 'Something'
        , reward: 'Some reward'
        , regularPunchesRequired: 10
        , elitePunchesRequired: 8
        , punchesRequiredToBecomeElite: 24
        , photoUrl: 'http://placekitten.com/204/300'
      };
      tu.loginAsAdmin(function() {
        tu.patch('/v1/businesses/' + ids[0] + '/loyalty', loyalty, function() {
          tu.logout(function() {
            tu.get('/v1/businesses/' + ids[0] + '/loyalty', function(err, results, res) {
              assert(res.statusCode == 200);
              var payload = JSON.parse(results);
              assert(payload.data.businessId === ids[0]);
              tu.depopulate('businesses', ids, done);
            });
          });
        });
      });
    });
  });

  var permFields = perms.business.default.read.concat(perms.business.world.read);
  it('should respond with a single business document with fields ' + permFields.join(', '), function(done) {
    tu.populate('businesses', [{
        name: 'Business 1',
        url: 'foobar.com',
        logoUrl: 'foobar.com/logo.png',
        cardCode: '123456-ABC',
        menuDescription: 'foobar',
        street1: 'asdf',
        street2: 'asdf',
        city: 'asdf',
        state: 'TX',
        zip: 12345,
        tags:['food'],
        isGB: false,
        isVerified:true
      }], function(err, ids) {
      tu.loginAsConsumer(function(error, res){
        tu.get('/v1/businesses/' + ids[0], function(err, results, res) {
          var payload = JSON.parse(results);
          assert(payload.data.id === ids[0]);

          for (var key in payload.data){
            assert(permFields.indexOf(key) > -1);
          }

          tu.logout(function(){ tu.depopulate('businesses', ids, done); });
        });
      });
    });
  });
});

describe('DEL /v1/businesses/:id', function() {
  it('should delete a single business document', function(done) {
    tu.populate('businesses', [{ name:'Business 1' }], function(err, ids) {
      tu.loginAsAdmin(function(error, user){
        // get the current count
        tu.get('/v1/businesses', function(err, results, res) {
          var total = JSON.parse(results).meta.total;
          tu.del('/v1/businesses/'+ids[0], function(err, results, res) {
            assert(res.statusCode == 204);
            // compare to updated count
            tu.get('/v1/businesses', function(err, results, res) {
              assert(parseInt(total, 10) - 1 === parseInt(JSON.parse(results).meta.total, 10));
              tu.logout(function(){ tu.depopulate('businesses', ids, done); });
            });
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
    , charityId: null
    , url: "http://ballersinc.com"
    , cardCode: "123456"
    , street1: "123 Sesame St"
    , street2: 'asdf'
    , city: "Austin"
    , state: "TX"
    , zip: 78756
    , tags: ['foo', 'bar']
    };

    tu.populate('charities', [{ name:'Some Charity' }], function(err, charityIds) {
      business.charityId = charityIds[0];

      tu.loginAsSales(function(error, user){
        tu.post('/v1/businesses', business, function(error, results, res){
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.id);

          tu.get('/v1/businesses/' + results.data.id, function(error, results){
            assert(!error);
            results = JSON.parse(results);
            assert(!results.error);
            // is gb false by default
            assert(results.data.isGB === false);
            assert(results.data.isVerified === true);
            tu.logout(function(){
              done();
            });
          });
        });
      });
    });
  });

  it('should save a verified goodybag business and return the id', function(done){
    var business = {
      name: "Ballers, Inc. 3"
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
        assert(res.statusCode == 200);
        results = JSON.parse(results);
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
        assert(res.statusCode == 200);
        results = JSON.parse(results);
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
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });

  it('should allow consumers to creeate unverified businesses', function(done){
    var business = {
      name: "Consumers, Inc."
    };

    tu.login({ email:'tferguson@gmail.com', password:'password' }, function(error, user){
      tu.post('/v1/businesses', business, function(error, results, res){
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.id);

        tu.logout(function() {
          tu.loginAsAdmin(function() {

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
    });
  });
});

describe('PATCH /v1/businesses/:id', function(){
  it('should update a business\'s name and url', function(done){
    var business = {
      name: "Poophead McGees"
    , url: "http://pmcgee.com"
    };

    tu.populate('businesses', [{ name:'Business 1' }], function(err, ids) {
      tu.loginAsSales(function(error, user){
        tu.patch('/v1/businesses/' + ids[0], business, function(error, results, res){
          assert(!error);
          assert(res.statusCode == 204);
          tu.logout(done);
        });
      });
    });
  });

  it('should login as a businesses manager and update the loyalty settings', function(done){
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('managers', [{ email:'loyalty@manager.com', password:'password', businessId:bids[0] }], function(err, uids) {
        tu.login({ email: 'loyalty@manager.com', password: 'password' }, function(error, user){
          assert(!error);
          var loyalty = {
            requiredItem: 'Coffee'
          , reward: 'Chicken'
          };

          tu.patch('/v1/businesses/' + bids[0] + '/loyalty', loyalty, function(error, results, res){
            assert(!error);
            assert(res.statusCode == 204);

            tu.get('/v1/businesses/' + bids[0] + '/loyalty', function(error, results, res){
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
    });
  });

  it('should login as a businesses manager and upsert the loyalty settings', function(done){
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('managers', [{ email:'manager_of_biz_without_loyalty@gmail.com', password:'password', businessId:bids[0] }], function() {
        tu.login({ email: 'manager_of_biz_without_loyalty@gmail.com', password: 'password' }, function(error, user){
          assert(!error);
          var loyalty = {
            requiredItem: 'Something'
          , reward: 'Some reward'
          , regularPunchesRequired: 10
          , elitePunchesRequired: 8
          , punchesRequiredToBecomeElite: 24
          , photoUrl: 'http://placekitten.com/204/300'
          };

          tu.patch('/v1/businesses/' + bids[0] + '/loyalty', loyalty, function(error, results, res){
            assert(res.statusCode == 204);

            tu.get('/v1/businesses/' + bids[0] + '/loyalty', function(error, results, res){
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
    });
  });

  it('should fail to update the loyalty settings because of invalid permissions', function(done){
    tu.populate('businesses', [{ name:'Business 1' }], function(err, bids) {
      tu.populate('managers', [{ email:'noloyaltyperms@manager.com', password:'password' }], function() {
        tu.login({ email: 'noloyaltyperms@manager.com', password: 'password' }, function(error, user){
          assert(!error);

          var loyalty = {
            requiredItem: 'Taco Bell'
          , reward: 'Poop'
          };

          tu.patch('/v1/businesses/' + bids[0] + '/loyalty', loyalty, function(error, results, res){
            assert(!error);

            results = JSON.parse(results);
            assert(results.error);
            assert(results.error.name === "NOT_ALLOWED");

            tu.logout(done);
          });
        });
      });
    });
  });

  it('should update a business\'s url to be null', function(done){
    tu.populate('businesses', [{ name:'Business 1' }], function(err, ids) {
      tu.loginAsSales(function(error, user){
        tu.patch('/v1/businesses/' + ids[0], { url:null }, function(error, results, res){
          assert(!error);
          assert(res.statusCode == 204);
          tu.logout(function(){
            done();
          });
        });
      });
    });
  });

  it('should update a business\'s url to be blank', function(done){
    tu.populate('businesses', [{ name:'Business 1' }], function(err, ids) {
      tu.loginAsSales(function(error, user){
        tu.patch('/v1/businesses/' + ids[0], { url:'' }, function(error, results, res){
          assert(res.statusCode == 204);
          tu.logout(done);
        });
      });
    });
  });

  it('should update a business\'s tags', function(done){
    var business = {
      tags:['foo','bar','baz']
    };

    tu.populate('businesses', [{ name:'Business 1' }], function(err, ids) {
      tu.loginAsSales(function(error, user){
        tu.patch('/v1/businesses/'+ids[0], business, function(error, results, res){
          assert(res.statusCode == 204);
          tu.get('/v1/businesses/'+ids[0], function(error, results, res) {
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

it('should work because user is business manager', function(done) {
  var user = {email: 'some_manager@gmail.com', password: 'password'};
  var business = {
    name: 'new biz name',
    url: 'http://blah.com',
    logoUrl: 'http://bla.com/img.jpg'
  };
  tu.login(user, ok(done, function() {
    tu.patch('/v1/businesses/' + 1, business, ok(done, function(result, res) {
      assert(res.statusCode === 204);
      tu.logout(done);
    }));
  }));
});

describe('GET /v1/businesses/contact-requests', function(){
  it('should respond with a list of business contact entries', function(done){
    tu.loginAsAdmin(function(){
      tu.get('/v1/businesses/contact-requests', function(error, results){
        assert(!error);
        results = JSON.parse(results);
        assert(results.data.length > 0);
        tu.logout(done);
      });
    });
  });

  it('should respond with a 403', function(done){
    tu.get('/v1/businesses/contact-requests', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 401);
      done()
    });
  });
});

describe('POST /v1/businesses/contact-requests', function(){
  it('should save a business contact entry', function(done) {
    var info = {
      name: 'Bob Johnson'
    , businessName: 'The Thing Store'
    , email: 'bob@thethingstore.com'
    , zip: 75189
    , comments: 'I WANT GOODYBAG. YOU GIVE TO BOB. BOB WANT TABLET. BOB WANT MENU ITEMS ON TABLET IN STORE. BOB HAVE MANY THINGS. BOB.'
    };

    tu.post('/v1/businesses/contact-requests', info, function(error, results, res){
      assert(!error);
      assert(res.statusCode == 204);
      tu.logout(done);
    });
  });

  it('should fail to save a business contact entry', function(done) {
    var info = {
      name: 'Bob Johnson'
    , businessName: 'The Thing Store'
    , email: 'bob@'
    , zip: '75189'
    , comments: 'I WANT GOODYBAG. YOU GIVE TO BOB. BOB WANT TABLET. BOB WANT MENU ITEMS ON TABLET IN STORE. BOB HAVE MANY THINGS. BOB.'
    };

    tu.post('/v1/businesses/contact-requests', info, function(error, results, res){
      assert(!error);
      assert(res.statusCode == 400);
      tu.logout(done);
    });
  });
});

describe('GET /v1/businesses/measures', function() {
  it('should deny non-business-owner', function(done) { 
    //this manager owns businessId:2 locationId:2
    var user = { email: 'manager_redeem3@gmail.com', password: 'password' };
    tu.login(user, function() {
      tu.get('/v1/businesses/1/measures', function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 403);
        tu.logout(done);
      });
    });
  });

  it('should get resource for ownerManager', function(done) {
    //this manager owns businessId:2 locationId:2
    var user = { email: 'some_manager@gmail.com', password: 'password' };
    tu.login(user, function() {
      tu.get('/v1/businesses/1/measures', function(error, results, res) {
        assert(!error);
        assert(res.statusCode !== 403);
        var data = JSON.parse(results).data;
        assert(data.totalLikes === 4);
        assert(data.totalUsers === 0);
        assert(data.totalPunches === 0);
        tu.logout(done);
      });
    });
    
  });
});
