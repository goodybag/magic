var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');
var config = require('../../config');

describe('GET /v1/consumers', function() {
  it('should respond with a consumer listing', function(done) {
    tu.get('/v1/consumers', function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.length > 0);
      done();
    });
  });
  it('should filter', function(done) {
    tu.get('/v1/consumers?filter=tferguson', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.length === 1);
      done();
    });
  });
  it('should paginate', function(done) {
    tu.get('/v1/consumers?offset=1&limit=1', function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.length === 1);
      assert(payload.meta.total > 1);
      done();
    });
  });
});

describe('GET /v1/consumers/:id', function() {
  it('should respond with a consumer', function(done) {
    tu.get('/v1/consumers/7', function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.userId === 7);
      done();
    });
  });

  it('should respond 404 if the id is not in the database', function(done){
    tu.get('/v1/consumers/500', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should respond 404 if the id is not in correct type', function(done){
    tu.get('/v1/consumers/asdf', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });
});

describe('POST /v1/consumers', function() {
  it('should create a consumer and respond with the user id and login', function(done) {
    var consumer = {
      email:      "testmctesterson99@test.com"
    , password:   "password"
    , firstName:  "Test"
    , lastName:   "McTesterson"
    , screenName: "testies"
    , cardId:     "123456-ZZZ"
    };

    tu.post('/v1/consumers', consumer, function(error, results) {
      assert(!error);
      results = JSON.parse(results);
      assert(!results.error);
      assert(results.data.id >= 0);
      tu.get('/v1/session', function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.id >= 0);
        tu.logout(done);
      });
    });
  });

  it('should fail if consumer email exists', function(done){
    var consumer = {
      email:      "sales@goodybag.com"
    , password:   "password"
    , firstName:  "Test"
    , lastName:   "McTesterson"
    , screenName: "testies"
    , cardId:     "123456-ZZZ"
    };

    tu.post('/v1/consumers', consumer, function(error, results, res){
      assert(!error);
      assert(res.statusCode === 400);
      results = JSON.parse(results);
      assert(results.error.name == 'EMAIL_REGISTERED');
      done();
    })
  });

  it('should fail if consumer screen name is in use', function(done){
    var consumer = {
      email:      "sljflkasdklfaklsdjf@goodybag.com"
    , password:   "password"
    , firstName:  "Test"
    , lastName:   "McTesterson"
    , screenName: "testies"
    , cardId:     "787564-ZZZ"
    };

    tu.post('/v1/consumers', consumer, function(error, results, res){
      assert(!error);
      assert(res.statusCode === 400);
      results = JSON.parse(results);
      assert(results.error.name == 'SCREENNAME_TAKEN');
      done();
    })
  });

  it('should fail because of an invalid cardId', function(done){
    var consumer = {
      email:      "consumer1234@goodybag.com"
    , password:   "password"
    , firstName:  "Test"
    , lastName:   "McTesterson"
    , screenName: "testies"
    , cardId:     "12345-ZZZ"
    };

    tu.post('/v1/consumers', consumer, function(error, results, res){
      assert(!error);
      results = JSON.parse(results);
      assert(res.statusCode === 400);
      assert(results.error.name == 'VALIDATION_FAILED');
      done();
    })
  });

  it('should fail if there is a required field missing', function(done){
    var consumer = {
      password:   "password"
    };

    tu.post('/v1/consumers', consumer, function(error, results, res){
      assert(!error);
      results = JSON.parse(results);
      assert(res.statusCode === 400);
      assert(results.error.name == 'VALIDATION_FAILED');
      done();
    })
  });

  it('should fail if there is a required field missing', function(done){
    var consumer = {
      email:   "email@gmail.com"
    };

    tu.post('/v1/consumers', consumer, function(error, results, res){
      assert(!error);
      results = JSON.parse(results);
      assert(res.statusCode === 400);
      assert(results.error.name == 'VALIDATION_FAILED');
      done();
    })
  });

  it('should fail if there is a required field missing', function(done){
    var consumer = { firstName: "johnasdfasdfasdf" };

    tu.post('/v1/consumers', consumer, function(error, results, res){
      assert(!error);
      results = JSON.parse(results);
      assert(res.statusCode === 400);
      assert(results.error.name == 'VALIDATION_FAILED');
      done();
    })
  });
});

describe('PUT /v1/consumers/:id', function() {
  it('should update a consumer', function(done) {
    var consumer = {
      firstName: "Terd"
    };
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.patch('/v1/consumers/7', consumer, function(error, results, res) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);

        tu.get('/v1/consumers/7', function(error, results) {
          assert(!error);
          results = JSON.parse(results);
          assert(!results.error);
          assert(results.data.firstName === "Terd");
          tu.logout(done);
        });
      });
    });
  });

  it('should update a consumers user record and consumer record via the session user id', function(done) {
    var consumer = {
      password: "password1"
    , firstName: "Terrrrd"
    };

    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error, user){
      tu.patch('/v1/consumers/session', consumer, function(error, results, res) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);

        tu.logout(function(){
          tu.login({ email: 'tferguson@gmail.com', password: consumer.password }, function(error, user){
            assert(!error);
            assert(user);

            tu.patch('/v1/consumers/7', {password: 'password'}, function(error, results, res) {
              assert(!error);
              results = JSON.parse(results);
              assert(!results.error);

              tu.get('/v1/consumers/7', function(error, results) {
                assert(!error);
                results = JSON.parse(results);
                assert(!results.error);
                assert(results.data.firstName === "Terrrrd");
                tu.logout(done);
              });
            });
          });
        });
      });
    });
  });

  it('should not update a consumer if permissions are absent', function(done) {
    var consumer = {
      firstName: "Terd"
    };
    tu.loginAsClient(function() {
      tu.patch('/v1/consumers/7', consumer, function(error, results, res) {
        assert(!error);
        assert(res.statusCode == 403);
        results = JSON.parse(results);
        assert(results.error);
        assert(results.error.name === "NOT_ALLOWED");
        tu.logout(function() {
          done();
        });
      });
    });
  });

  it('should respond 404 if the id is not in the database', function(done){
    var consumer = {
      lastName: "consuemr"
    };
    tu.loginAsAdmin(function() {
      tu.patch('/v1/consumers/500000', consumer, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 404);
        tu.logout(function() {
          done();
        });
      });
    });
  });

  it('should respond 400 if a unique constraint is violated', function(done){
    var consumer = {
      email: "tferguson@gmail.com"
    };
    tu.loginAsAdmin(function() {
      tu.patch('/v1/consumers/500000', consumer, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 400);
        results = JSON.parse(results);
        assert(results.error.name === "EMAIL_REGISTERED");
        tu.logout(function() {
          done();
        });
      });
    });
  });

  // Skip this for now
  // it('should update a consumers email and password when they registered with facebook', function(done) {
  //   this.timeout(30000);
  //   tu.createTestOauthUser(function(error, results){
  //     if (error) console.log(error);
  //     assert(!error);

  //     // Post to our oauth
  //     var user = {
  //       group: 'consumer'
  //     , singlyId: results.account
  //     , singlyAccessToken: results.access_token
  //     };

  //     var update = {
  //       email: "testsstsststst@test.com"
  //     , password: "password"
  //     };

  //     tu.post('/v1/oauth', user, function(error, results){
  //       if (error) console.log(error);
  //       assert(!error);

  //       results = JSON.parse(results);
  //       if (results.error) console.log(results.error);
  //       assert(!results.error);
  //       assert(results.data.id > 0);

  //       var userId = results.data.id;

  //       tu.patch('/v1/consumers/' + userId , user, function(error, results, res) {
  //         if (error) console.log(error);
  //         assert(!error);
  //         results = JSON.parse(results);
  //         if (results.error) console.log(results.error);
  //         assert(!results.error);

  //         tu.logout(function(){
  //           tu.login(update, function(error, results){
  //             if (error) console.log(error);
  //             assert(!error);
  //             assert(results.id === userId);
  //             tu.logout(function(){
  //               done();
  //             });
  //           });
  //         });
  //       });
  //     });
  //   });
  // });
});

describe('DEL /v1/consumers/:id', function() {
  var id = 13; // Dumb consumer not used for anything
  it('should delete a single consumer whose userId is ' + id, function(done) {
    tu.loginAsAdmin(function(error, consumer){
      tu.del('/v1/consumers/' + id, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);
        tu.logout(done);
      });
    });
  });

  it('should fail to delete a single consumer because of lack of permissions', function(done) {
    tu.loginAsClient(function(error, consumer){
      tu.del('/v1/consumers/7', function(error, results, res) {
        assert(!error);
        assert(res.statusCode == 403);
        results = JSON.parse(results);
        assert(results.error);
        assert(results.error.name === "NOT_ALLOWED");
        tu.logout(done);
      });
    });
  });

  it('should perform a flash login and delete the user', function(done) {
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user){
      tu.tapinAuthRequest('DELETE', '/v1/consumers/14', '123456-YYZ', function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 200);

        tu.get('/v1/consumers/14', function(error, result, res){
          assert(!error);
          assert(res.statusCode === 404);

          tu.logout(done);
        });
      });
    });
  });
});

describe('GET /v1/consumers/:id/collections', function() {
  it('should respond with a collection listing', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections', function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.length > 0);
        assert(results.data[0].id);
        assert(results.data[0].name);
        assert(results.data[0].numProducts == 2);
        assert(results.data[0].totalMyLikes != 'undefined');
        assert(results.data[0].totalMyWants != 'undefined');
        assert(results.data[0].totalMyTries != 'undefined');
        assert(results.data[1].numProducts == 3);
        tu.logout(done);
      });
    });
  });
  it('should paginate', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections?offset=1&limit=1', function(err, results, res) {
        assert(!err);
        var payload = JSON.parse(results);
        assert(!payload.error);
        assert(payload.data.length === 1);
        assert(payload.meta.total > 1);
        done();
      });
    });
  });
});

describe('GET /v1/consumers/:id/collections/:collectionId', function() {
  it('should respond with a collection', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/1', function(error, results) {
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.id);
        assert(results.data.name);
        assert(results.data.numProducts == 2);
        assert(results.data.totalMyLikes != 'undefined');
        assert(results.data.totalMyWants != 'undefined');
        assert(results.data.totalMyTries != 'undefined');
        tu.logout(done);
      });
    });
  });
});

describe('POST /v1/consumers/:id/collections', function() {
  it('should create a new collection and respond with its ID', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.post('/v1/consumers/7/collections', {name:'my third collection'}, function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.id);
        tu.logout(done);
      });
    });
  });
  it('should fail validation if bad input is given', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.post('/v1/consumers/7/collections', {name:null}, function(error, results, res) {
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });
});

describe('PUT /v1/consumers/:id/collections/:collectionId', function() {
  it('should update the collection name', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.put('/v1/consumers/7/collections/1', { name:'Another crazy name!' }, function(error, results, res) {
        assert(res.statusCode == 200);
        tu.get('/v1/consumers/7/collections/1', function(error, results) {
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.name == 'Another crazy name!');
          tu.logout(done);
        });
      });
    });
  });
});

describe('POST /v1/consumers/:id/collections/:collectionId', function() {
  it('should add a product to the collection', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/1/products', function(error, results, res) {
        assert(res.statusCode == 200);
        var oldProducts = JSON.parse(results).data;
        tu.post('/v1/consumers/7/collections/1', { productId:4 }, function(error, results, res) {
          assert(res.statusCode == 200);
          tu.get('/v1/consumers/7/collections/1/products', function(error, results, res) {
            assert(res.statusCode == 200);
            var newProducts = JSON.parse(results).data;
            assert(oldProducts.length + 1 == newProducts.length);
            tu.logout(done);
          });
        });
      });
    });
  });
  it('should fail validation if bad input is given', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.post('/v1/consumers/7/collections/1', {productId:null}, function(error, results, res) {
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });
});

describe('DELETE /v1/collections/:collectionId', function() {
  it('should delete a users collection', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.post('/v1/consumers/7/collections', {name:'my foobar collection'}, function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.id);
        var id = results.data.id;
        tu.get('/v1/consumers/7/collections', function(error, results, res){
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.filter(function(c){ return c.name === 'my foobar collection'}).length === 1);
          tu.del('/v1/collections/' + id, function(error, results, res){
            assert(res.statusCode == 200);
            tu.get('/v1/consumers/7/collections', function(error, results, res){
              assert(res.statusCode == 200);
              results = JSON.parse(results);
              assert(results.data.filter(function(c){ return c.name === 'my foobar collection'}).length === 0);
              tu.logout(done);
            })
          });
        });

      });
    });
  });

  it('should fail to delete a users collection because of unsufficient permissions', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.post('/v1/consumers/7/collections', {name:'my foobar2 collection'}, function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.id);
        var id = results.data.id;
        tu.get('/v1/consumers/7/collections', function(error, results, res){
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.filter(function(c){ return c.name === 'my foobar2 collection'}).length === 1);
          tu.logout(function(){
            tu.login({ email: 'consumer4@gmail.com', password: 'password' }, function(error){
              tu.del('/v1/collections/' + id, function(error, results, res){
                assert(res.statusCode == 403);
                results = JSON.parse(results);
                assert(results.error);
                assert(results.error.name === "NOT_ALLOWED");
                tu.logout(done);
              });
            });
          });
        });
      });
    });
  });
});


describe('POST /v1/consumers/cardupdate', function() {
  it('should get a token on cardUpdate and then update the cardId with the token', function(done) {
    tu.loginAsAdmin(function(error){

      tu.post('/v1/consumers/cardupdate', { email:'tferguson@gmail.com', cardId:'999999-ZZZ' }, function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.token);

        tu.post('/v1/consumers/cardupdate/'+results.data.token, {}, function(error, results, res) {
          assert(res.statusCode == 200);

          tu.get('/v1/consumers/7', function(err, results, res) {
            assert(res.statusCode == 200);
            results = JSON.parse(results);
            assert(results.data.cardId == '999999-ZZZ');

            tu.patch('/v1/users/7', { cardId:'123456-ABC' }, function(err, results, res) {
              assert(res.statusCode == 200);
              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should not return the token if session is not with admin', function(done) {
    tu.post('/v1/consumers/cardupdate', { email:'tferguson@gmail.com', cardId:'999999-ZZZ' }, function(error, results, res) {
      assert(res.statusCode == 200);
      results = JSON.parse(results);
      assert(!results.data);
      done();
    });
  });
});