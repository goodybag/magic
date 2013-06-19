var assert = require('better-assert');
var sinon = require('sinon');
var magic = require('../../lib/magic');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');
var config = require('../../config');

describe('GET /v1/consumers', function() {
  it('should respond with a consumer listing', function(done) {
    tu.populate('consumers', [{email:'test@test.com', password:'password'}], function(err, ids) {
      tu.get('/v1/consumers', function(error, results) {
        assert(!error);
        results = JSON.parse(results);
        assert(!results.error);
        assert(results.data.length > 0);
        tu.depopulate('consumers', ids, done);
      });
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
      assert(results.data.id === 7);
      done();
    });
  });

  it('should never respond with the password or salt', function(done) {
    tu.loginAsAdmin(function() {
      tu.get('/v1/consumers/7', function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(!results.data.password);
        assert(!results.data.passwordSalt);
        tu.logout(done);
      });
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
    , avatarUrl:  "http://loljk.com/foobar.png"
    , cardId:     "123456-zzz"
    };

    tu.post('/v1/consumers', consumer, function(error, results, res) {
      assert(res.statusCode == 200);
      results = JSON.parse(results);
      var id = results.data.id;
      assert(id >= 0);
      tu.get('/v1/consumers/'+id, function(error, results) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        for (var k in consumer) {
          if (k == 'cardId') assert(results.data[k] == consumer[k].toUpperCase())
          else if (k != 'password') assert(results.data[k] == consumer[k]);
        }

        // Ensure createdAt is getting set
        tu.loginAsAdmin(function(error){
          assert(!error);

          tu.get('/v1/consumers/'+id, function(error, results) {
            assert(!error);
            results = JSON.parse(results);
            assert(results.data.createdAt != null);

            tu.logout(done);
          });
        });
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

  it('should fail if the password is too short', function(done){
    var consumer = {
      email:      "testmctesterson99@test.com"
    , password:   "pa"
    , firstName:  "Test"
    , lastName:   "McTesterson"
    , screenName: "testies"
    , avatarUrl:  "http://loljk.com/foobar.png"
    , cardId:     "123456-zzz"
    };

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
        assert(res.statusCode == 204);

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
      firstName: "Terrrrd"
    };

    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error, user){
      tu.patch('/v1/consumers/session', consumer, function(error, results, res) {
        assert(res.statusCode == 204);
        tu.logout(done);
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
      tu.patch('/v1/consumers/6', consumer, function(error, results, res){
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

  it('should respond 400 if email is blank or null', function(done){
    var consumer = {
      email: ""
    };
    tu.loginAsAdmin(function() {
      tu.patch('/v1/consumers/6', consumer, function(error, results, res){
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });

  it('should update a users record even though they sent an email with put that already belongs to them', function(done){
    var consumer = {
      email: "tferguson@gmail.com"
    , firstName: 'Tuuuuuuuuuuuuuuuurrrrdd'
    };
    tu.login({email: consumer.email, password: 'password'}, function() {
      tu.patch('/v1/consumers/7', consumer, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 204);
        tu.get('/v1/consumers/7', function(error, results, res){
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.firstName == consumer.firstName);

          tu.logout(function() {
            done();
          });
        });
      });
    });
  });

  it('should update a users record even though they sent a screenName with put that already belongs to them', function(done){
    var consumer = {
      email: "tferguson@gmail.com"
    , screenName: 'tferguson'
    , firstName: 'ablkajsldkjlk'
    };
    tu.login({email: consumer.email, password: 'password'}, function() {
      tu.patch('/v1/consumers/7', consumer, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 204);
        tu.get('/v1/consumers/7', function(error, results, res){
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.firstName == consumer.firstName);

          tu.logout(function() {
            done();
          });
        });
      });
    });
  });

  it('should update a users record as an admin even though they sent an email with put that already belongs to them', function(done){
    var consumer = {
      email: "tferguson@gmail.com"
    , firstName: 'Tuuuuuurrrrdd'
    };
    tu.loginAsAdmin(function() {
      tu.patch('/v1/consumers/7', consumer, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 204);
        tu.get('/v1/consumers/7', function(error, results, res){
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.firstName == consumer.firstName);

          tu.logout(function() {
            done();
          });
        });
      });
    });
  });

  it('should create a partialRegistration record if there is email but no password or singlyId', function(done) {
    tu.loginAsTablet(function(){
      tu.tapinAuthRequest('GET', '/v1/session', '0000010-___', function(err, results, res) {
        // should have created a blank user
        assert(err == null);
        var payload = JSON.parse(results);
        assert(payload.error == null);
        assert(payload.meta != null);
        assert(payload.meta.isFirstTapin === true);
        assert(payload.meta.userId != null);
        var userId = payload.meta.userId;
        var data = {email:'test_10@example.com'};

        var event = 'user.partialRegistration';

        var callback = function(user, email, token){
          assert(email === data.email);
          assert(user.toString() === userId.toString());
          assert(token != null);
          magic.removeListener(event, callback);
          done();
        };

        magic.on(event, callback);

        tu.tapinAuthRequest('PUT', '/v1/consumers/' + userId, '0000010-___', data, function(err, result){});
      });
    });
  });

  it('should steal a card id if email and password are null', function(done) {
    tu.loginAsAdmin(function() {
      var cardId = '432123-AAD';
      tu.put('/v1/consumers/27', {cardId:cardId}, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 204);
        tu.get('/v1/users/27', function(error, results, res) {
          assert(!error);
          var payload;
          try {
            payload = JSON.parse(results);
          } catch(err) {
            assert('json parse error' === false); // put something useful in the dump
          }
          assert(payload != null);
          assert(payload.error == null);
          assert(payload.data != null);
          assert(payload.data.cardId === cardId);

          tu.get('/v1/users/23', function(error, results, res) { // the user who previously held the cardId
            assert(!error);
            var payload;
            try {
              payload = JSON.parse(results);
            } catch(err) {
              assert('json parse error' === false); // put something useful in the dump
            }
            assert(payload != null);
            assert(payload.error == null);
            assert(payload.data != null);
            assert(payload.data.cardId == null);

            tu.logout(done);
          });
        });
      });
    });
  });

  it('should steal a card id if email is null and password is not', function(done) {
    tu.loginAsAdmin(function() {
      var cardId = '432123-AAE';
      tu.put('/v1/consumers/27', {cardId:cardId}, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 204);
        tu.get('/v1/users/27', function(error, results, res) {
          assert(!error);
          var payload;
          try {
            payload = JSON.parse(results);
          } catch(err) {
            assert('json parse error' === false); // put something useful in the dump
          }
          assert(payload != null);
          assert(payload.error == null);
          assert(payload.data != null);
          assert(payload.data.cardId === cardId);

          tu.get('/v1/users/24', function(error, results, res) { // the user who previously held the cardId
            assert(!error);
            var payload;
            try {
              payload = JSON.parse(results);
            } catch(err) {
              assert('json parse error' === false); // put something useful in the dump
            }
            assert(payload != null);
            assert(payload.error == null);
            assert(payload.data != null);
            assert(payload.data.cardId == null);

            tu.logout(done);
          });
        });
      });
    });
  });

  it('should steal a card id if email is not null and password is null', function(done) {
    tu.loginAsAdmin(function() {
      var cardId = '432123-AAF';
      tu.put('/v1/consumers/27', {cardId:cardId}, function(error, results, res) {
        assert(!error);
        assert(res.statusCode === 204);
        tu.get('/v1/users/27', function(error, results, res) {
          assert(!error);
          var payload;
          try {
            payload = JSON.parse(results);
          } catch(err) {
            assert('json parse error' === false); // put something useful in the dump
          }
          assert(payload != null);
          assert(payload.error == null);
          assert(payload.data != null);
          assert(payload.data.cardId === cardId);

          tu.get('/v1/users/25', function(error, results, res) { // the user who previously held the cardId
            assert(!error);
            var payload;
            try {
              payload = JSON.parse(results);
            } catch(err) {
              assert('json parse error' === false); // put something useful in the dump
            }
            assert(payload != null);
            assert(payload.error == null);
            assert(payload.data != null);
            assert(payload.data.cardId == null);

            tu.logout(done);
          });
        });
      });
    });
  });

  it('should not steal a card id if email is not null and password is not null', function(done) {
    tu.loginAsAdmin(function() {
      var cardId = '432123-AAG';
      tu.put('/v1/consumers/27', {cardId:cardId}, function(error, results, res) {
        assert(res.statusCode === 412);
        tu.get('/v1/users/27', function(error, results, res) {
          assert(!error);
          var payload;
          try {
            payload = JSON.parse(results);
          } catch(err) {
            assert('json parse error' === false); // put something useful in the dump
          }
          assert(payload != null);
          assert(payload.error == null);
          assert(payload.data != null);
          assert(payload.data.cardId == '432123-AAF'); // the card id from the last test.  test independence isn't important, right?

          tu.get('/v1/users/26', function(error, results, res) { // the user who previously held the cardId
            assert(!error);
            var payload;
            try {
              payload = JSON.parse(results);
            } catch(err) {
              assert('json parse error' === false); // put something useful in the dump
            }
            assert(payload != null);
            assert(payload.error == null);
            assert(payload.data != null);
            assert(payload.data.cardId === cardId);

            tu.logout(done);
          });
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
        assert(res.statusCode === 204);
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
        assert(res.statusCode === 204);

        tu.get('/v1/consumers/14', function(error, result, res){
          assert(!error);
          assert(res.statusCode === 404);

          tu.logout(done);
        });
      });
    });
  });
});


describe('POST /v1/consumers/:id/password', function() {
  it('should update a consumers password', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error, user){
      var request = {
        method: 'POST',
        path: '/v1/consumers/session/password',
        headers: {
          'Content-type': 'application/json',
          'Authorization': 'Basic '+(new Buffer('tferguson@gmail.com:password')).toString('base64')
        }
      };
      tu.httpRequest(request, JSON.stringify({ password:'wordpass' }), function(error, results, res) {
        assert(res.statusCode == 204);
        tu.logout(function(){
          tu.login({ email: 'tferguson@gmail.com', password: 'wordpass' }, function(error, user){
            assert(user);
            var request = {
              method: 'POST',
              path: '/v1/consumers/session/password',
              headers: {
                'Content-type': 'application/json',
                'Authorization': 'Basic '+(new Buffer('tferguson@gmail.com:wordpass')).toString('base64')
              }
            };
            tu.httpRequest(request, JSON.stringify({ password:'password' }), function(error, results, res) {
              assert(res.statusCode == 204);
              tu.logout(done);
            });
          });
        });
      });
    });
  });
  it('should respond 401 if the old password is incorrect', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error, user){
      var request = {
        method: 'POST',
        path: '/v1/consumers/session/password',
        headers: {
          'Content-type': 'application/json',
          'Authorization': 'Basic '+(new Buffer('tferguson@gmail.com:foobar')).toString('base64')
        }
      };
      tu.httpRequest(request, JSON.stringify({ password:'wordpass' }), function(error, results, res) {
        assert(res.statusCode == 401);
        tu.logout(done);
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
        assert(results.data[1].id);
        tu.logout(done);
      });
    });
  });
  it('should correctly populate the all collection with aggregate data', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections?limit=1000', function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        var allCollection = results.data.filter(function(c) { return c.id == 'all'; })[0];
        assert(allCollection.numProducts === 4); // # of distinct products
        assert(allCollection.totalMyLikes === 3); // # of distinct likes
        assert(allCollection.totalMyWants === 1); // etc
        assert(allCollection.totalMyTries === 1);
        tu.logout(done);
      });
    });
  });
  it('should include All, Food, and NOT Fashion', function(done) {
    // gotta make a new consumer through the API first-- that's how these collections get made
    tu.post('/v1/consumers', { email:'allfoodfashion@consumers.com', password:'password' });
    magic.once('debug.newConsumerCollectionsCreated', function() {
      tu.login({ email: 'allfoodfashion@consumers.com', password: 'password' }, function(error, user){
        assert(user.id);
        tu.get('/v1/consumers/'+user.id+'/collections', function(error, results, res) {
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          // Ensure the all collection has the photoUrl set
          assert(results.data.filter(function(c) {
            return c.id == 'all' && c.photoUrl == config.allCollectionPhotoUrl;
          }).length === 1);
          assert(results.data.filter(function(c) { return c.id == 'food'; }).length === 1);
          assert(results.data.filter(function(c) { return c.id == 'fashion'; }).length === 0);

          tu.logout(done);
        });
      });
    });
  });
  it('should include hidden collections when ?showHidden=true', function(done) {
    // gotta make a new consumer through the API first-- that's how the hidden uncategorized collection gets made
    tu.post('/v1/consumers', { email:'hiddencollections@consumers.com', password:'password' });
    magic.once('debug.newConsumerCollectionsCreated', function() {
      tu.login({ email: 'hiddencollections@consumers.com', password: 'password' }, function(error, user){
        assert(user.id);
        tu.get('/v1/consumers/'+user.id+'/collections?showHidden=true', function(error, results, res) {
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.filter(function(c) { return c.id == 'all'; }).length === 1);
          assert(results.data.filter(function(c) { return c.id == 'food'; }).length === 1);
          assert(results.data.filter(function(c) { return c.id == 'uncategorized'; }).length === 1);
          tu.logout(done);
        });
      });
    });
  });
  it('should paginate', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections?limit=1', function(err, results, res) {
        assert(res.statusCode == 200);
        assert(JSON.parse(results).data[0].id == 'all');
        tu.get('/v1/consumers/7/collections?offset=1&limit=1', function(err, results, res) {
          assert(res.statusCode == 200);
          var payload = JSON.parse(results);
          assert(payload.data.length === 1);
          assert(payload.meta.total > 1);
          tu.logout(done);
        });
      });
    });
  });
});

describe('GET /v1/consumers/:id/collections/:collectionId', function() {
  it('should respond with a collection', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/1', function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.id == 'mypseudo');
        assert(results.data.name);
        assert(results.data.numProducts == 2);
        assert(typeof results.data.totalMyLikes != 'undefined');
        assert(typeof results.data.totalMyWants != 'undefined');
        assert(typeof results.data.totalMyTries != 'undefined');
        tu.logout(done);
      });
    });
  });
  it('should provide the All collection at /all', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/all', function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.id == 'all');
        assert(results.data.numProducts === 4);
        tu.logout(done);
      });
    });
  });
  it('should provide collections by their pseudoKeys', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/uncategorized', function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.id == 'uncategorized');
        tu.logout(done);
      });
    });
  });
  it('should respond 403 on invalid perms', function(done) {
    tu.get('/v1/consumers/7/collections/1', function(error, results, res) {
      assert(res.statusCode == 403);
      done();
    });
  });
  it('should respond 404 with invalid collection name', function(done){
    // gotta make a new consumer through the API first-- that's how these collections get made
    tu.post('/v1/consumers', { email:'blahblahalhblahlblh@consumers.com', password:'password' });
    magic.once('debug.newConsumerCollectionsCreated', function() {
      tu.login({ email: 'blahblahalhblahlblh@consumers.com', password: 'password' }, function(error, user){
        assert(!error);

        tu.get('/v1/consumers/' + user.id + '/collections/fashion', function(error, results, res){
          assert(!error);
          assert(res.statusCode == 404);
          tu.logout(done);
        });
      });
    });
  })
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
        assert(res.statusCode == 204);
        tu.get('/v1/consumers/7/collections/1', function(error, results, res) {
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.name == 'Another crazy name!');
          tu.logout(done);
        });
      });
    });
  });
  it('should work with pseudo-keys', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.put('/v1/consumers/7/collections/mypseudo', { name:'Some other crazy name!' }, function(error, results, res) {
        assert(res.statusCode == 204);
        tu.get('/v1/consumers/7/collections/mypseudo', function(error, results, res) {
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.name == 'Some other crazy name!');
          tu.logout(done);
        });
      });
    });
  });
});

describe('DELETE /v1/consumers/:consumerId/collections/:collectionId', function() {
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
          assert(results.data.filter(function(c){ return c.name === 'my foobar collection'; }).length === 1);
          tu.del('/v1/consumers/7/collections/' + id, function(error, results, res){
            assert(res.statusCode == 204);
            tu.get('/v1/consumers/7/collections', function(error, results, res){
              assert(res.statusCode == 200);
              results = JSON.parse(results);
              assert(results.data.filter(function(c){ return c.name === 'my foobar collection'; }).length === 0);
              tu.logout(done);
            });
          });
        });
      });
    });
  });

  // it('should delete a users collection via the pseudo-key', function(done) {
  //   // gotta make a new consumer through the API first-- that's how these collections get made
  //   tu.post('/v1/consumers', { email:'pseudokeydelete@consumers.com', password:'password' });
  //   magic.once('debug.newConsumerCollectionsCreated', function() {
  //     tu.login({ email: 'pseudokeydelete@consumers.com', password: 'password' }, function(error, user){
  //       tu.del('/v1/consumers/'+user.id+'/collections/fashion', function(error, results, res){
  //         assert(res.statusCode == 204);
  //         tu.get('/v1/consumers/'+user.id+'/collections', function(error, results, res){
  //           assert(res.statusCode == 200);
  //           results = JSON.parse(results);
  //           assert(results.data.filter(function(c){ return c.name === 'Fashion'; }).length === 0);
  //           tu.logout(done);
  //         });
  //       });
  //     });
  //   });
  // });

  it('should fail to delete a users collection because of insufficient permissions', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.post('/v1/consumers/7/collections', {name:'my foobar2 collection'}, function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.id);
        var id = results.data.id;
        tu.get('/v1/consumers/7/collections', function(error, results, res){
          assert(res.statusCode == 200);
          results = JSON.parse(results);
          assert(results.data.filter(function(c){ return c.name === 'my foobar2 collection'; }).length === 1);
          tu.logout(function(){
            tu.login({ email: 'consumer4@gmail.com', password: 'password' }, function(error){
              tu.del('/v1/consumers/7/collections/' + id, function(error, results, res){
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

describe('GET /v1/consumers/:id/collections/:collectionId/products', function() {
  it('should get the products in the collection', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/1/products', function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.length == 2);
        assert(new Date(results.data[0].createdAt) >= new Date(results.data[1].createdAt))
        tu.logout(done);
      });
    });
  });
  it('should filter products in a collection', function(done) {
    tu.populate('products', [{ name: 'SUPERUNIQUENAME', businessId: 1 }], function(error, pids){
      assert(!error);

      var pid = pids[0];

      tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
        tu.post('/v1/consumers/7/collections/1/products', { productId: pid }, function(error, results, res) {
          assert(res.statusCode == 204);
          tu.get('/v1/consumers/7/collections/1/products?filter=SUPERUNIQUENAME&limit=1000', function(error, results, res) {
            assert(res.statusCode == 200);
            results = JSON.parse(results);
            assert(results.data.filter(function(p){
              return p.id == pid;
            }).length == 1);
            tu.logout(done);
          });
        });
      });
    });
  });
  it('should get the products in all collections on id==all', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/all/products', function(error, results, res) {
        assert(res.statusCode == 200);
        assert(JSON.parse(results).data.length > 0);
        tu.logout(done);
      });
    });
  });
  it('should get the products using pseudo-keys', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/mypseudo/products', function(error, results, res) {
        assert(res.statusCode == 200);
        results = JSON.parse(results);
        assert(results.data.length > 0);
        tu.logout(done);
      });
    });
  });
  it('should include collections data on request', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/1/products?include=collections', function(error, results, res) {
        assert(res.statusCode == 200);
        var products = JSON.parse(results).data;
        assert(products.filter(function(p) { return p.collections.length > 0; }).length > 0);
        tu.logout(done);
      });
    });
  });
  it('should include user photos data on request', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/1/products?include=userPhotos', function(error, results, res) {
        assert(res.statusCode == 200);
        var products = JSON.parse(results).data;
        assert(products.filter(function(p) { return typeof p.photos == 'undefined'; }).length === 0);
        tu.logout(done);
      });
    });
  });
});

describe('POST /v1/consumers/:id/collections/:collectionId/products', function() {
  it('should add a product to the collection', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/1/products', function(error, results, res) {
        assert(res.statusCode == 200);
        var oldProducts = JSON.parse(results).data;
        tu.post('/v1/consumers/7/collections/1/products', { productId:4 }, function(error, results, res) {
          assert(res.statusCode == 204);
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
  it('should add a product to the collection with pseudo-keys', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/mypseudo/products', function(error, results, res) {
        assert(res.statusCode == 200);
        var oldProducts = JSON.parse(results).data;
        tu.post('/v1/consumers/7/collections/mypseudo/products', { productId:5 }, function(error, results, res) {
          assert(res.statusCode == 204);
          tu.get('/v1/consumers/7/collections/mypseudo/products', function(error, results, res) {
            assert(res.statusCode == 200);
            var newProducts = JSON.parse(results).data;
            assert(oldProducts.length + 1 == newProducts.length);
            tu.logout(done);
          });
        });
      });
    });
  });
  it('should work on consumers uncategorized', function(done) {
    // gotta make a new consumer through the API first-- that's how these collections get made
    tu.post('/v1/consumers', { email:'pseudokeypost@consumers.com', password:'password' });
    magic.once('debug.newConsumerCollectionsCreated', function() {
      tu.login({ email: 'pseudokeypost@consumers.com', password: 'password' }, function(error, user){
        tu.post('/v1/consumers/'+user.id+'/collections/uncategorized/products', { productId:1 }, function(error, results, res){
          assert(res.statusCode == 204);
          tu.logout(done);
        });
      });
    });
  });
  it('should fail validation if bad input is given', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.post('/v1/consumers/7/collections/1/products', {productId:null}, function(error, results, res) {
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });
});

describe('DELETE /v1/consumers/:id/collections/:collectionId/products/:productId', function() {
  it('should remove a product from the collection', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/1/products', function(error, results, res) {
        assert(res.statusCode == 200);
        var oldProducts = JSON.parse(results).data;
        tu.del('/v1/consumers/7/collections/1/products/4', function(error, results, res) {
          assert(res.statusCode == 204);
          tu.get('/v1/consumers/7/collections/1/products', function(error, results, res) {
            assert(res.statusCode == 200);
            var newProducts = JSON.parse(results).data;
            assert(oldProducts.length - 1 == newProducts.length);
            tu.logout(done);
          });
        });
      });
    });
  });
  it('should remove a product from the collection using pseudokeys', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/mypseudo/products', function(error, results, res) {
        assert(res.statusCode == 200);
        var oldProducts = JSON.parse(results).data;
        tu.del('/v1/consumers/7/collections/mypseudo/products/5', function(error, results, res) {
          assert(res.statusCode == 204);
          tu.get('/v1/consumers/7/collections/mypseudo/products', function(error, results, res) {
            assert(res.statusCode == 200);
            var newProducts = JSON.parse(results).data;
            assert(oldProducts.length - 1 == newProducts.length);
            tu.logout(done);
          });
        });
      });
    });
  });
  it('should remove a product from all collections if the "All" collection is targeted', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.get('/v1/consumers/7/collections/1/products', function(error, results, res) {
        assert(res.statusCode == 200);
        var oldCollectionOneSize = JSON.parse(results).data.length;
        tu.get('/v1/consumers/7/collections/2/products', function(error, results, res) {
          assert(res.statusCode == 200);
          var oldCollectionTwoSize = JSON.parse(results).data.length;
          tu.del('/v1/consumers/7/collections/all/products/2', function(error, results, res) {
            assert(res.statusCode == 204);
            tu.get('/v1/consumers/7/collections/1/products', function(error, results, res) {
              assert(res.statusCode == 200);
              assert(oldCollectionOneSize - 1 == JSON.parse(results).data.length);
              tu.get('/v1/consumers/7/collections/2/products', function(error, results, res) {
                assert(res.statusCode == 200);
                assert(oldCollectionTwoSize - 1 == JSON.parse(results).data.length);
                tu.logout(done);
              });
            });
          });
        });
      });
    });
  });
  it('should fail validation if bad input is given', function(done) {
    tu.login({ email: 'tferguson@gmail.com', password: 'password' }, function(error){
      tu.post('/v1/consumers/7/collections/1/products', {productId:null}, function(error, results, res) {
        assert(res.statusCode == 400);
        tu.logout(done);
      });
    });
  });
});

describe('The consumer cardupdate flow', function(){

  it('should update a consumers cardId given that the consumer did not previously have a cardId', function(done){

    var consumer = {
      email:      'ccc1@gmail.com'
    , firstName:  'Test'
    , lastName:   'Testling'
    , password:   'password'
    };

    var cardId = '309146-UEW';

    utils.stage({

      'start':
      // First populate the consumer
      function(next){
        tu.populate('consumers', [consumer], function(error, ids){
          assert(!error);
          assert(ids.length > 0);

          consumer.id = ids[0];

          next('Tapin with new card');
        });
      }

      , 'Tapin with new card':
        // Consumer does some action requiring a tapin with a new card
        // a new user should be created
        function(next, finish){
          tu.loginAsTablet(function(error, tablet){
            assert(!error);

            tu.tapinAuthRequest('GET', '/v1/session', cardId, function(error, results, res){
              assert(!error);
              results = JSON.parse(results);

              assert(results.meta.isFirstTapin);

              assert(results.meta.userId);

              next('Perform email update', results.meta.userId);
            });
          });
        }

      , 'Perform email update':
        // Tablet recognizes it was a new user and wants to update the new users
        // record with the email they entered at the tablet
        // However, the email they put in already exists so put in a cardupdate
        function(userId, next, finish){
          var update = { email: consumer.eamil };
          tu.tapinAuthRequest('PUT', '/v1/consumers/' + userId, cardId, update, function(error, results, res){
            assert(!error);
            assert(res.statusCode == 400);
            results = JSON.parse(results);
            assert(results.error.name == 'EMAIL_TAKEN');

            next('Submit cardupdate request');
          });
        }

      , 'end':
        function(){
          tu.logout(done);
        }

    })();

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
          assert(res.statusCode == 204);

          tu.get('/v1/consumers/7', function(err, results, res) {
            assert(res.statusCode == 200);
            results = JSON.parse(results);
            assert(results.data.cardId == '999999-ZZZ');

            tu.patch('/v1/users/7', { cardId:'123456-ABC' }, function(err, results, res) {
              assert(res.statusCode == 204);
              tu.logout(done);
            });
          });
        });
      });
    });
  });

  it('should not return the token if session is not with admin', function(done) {
    tu.post('/v1/consumers/cardupdate', { email:'tferguson@gmail.com', cardId:'999999-ZZZ' }, function(error, results, res) {
      assert(res.statusCode == 204);
      done();
    });
  });
});
