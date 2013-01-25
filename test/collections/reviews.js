var
  assert  = require('better-assert')
  , sinon   = require('sinon')
  , utils   = require('./../../lib/utils')
  , tu      = require('./../../lib/test-utils')
  , config  = require('./../../config')
  ;

describe('GET /v1/reviews', function(){
  it('should response with business from oddityLive join oddityMeta', function(done){
    tu.get('/v1/reviews', function(error, results){
      assert(!error);
      console.log()
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.length > 0);
      assert(payload.data[0].id);
      assert(payload.data[0].biz_name)
      done();
    });
  });
})

describe('GET /v1/reviews/:id', function() {
  it('should respond with a single business', function(done) {
    var id = 1;
    tu.get('/v1/reviews/' + id, function(err, results, res) {
      assert(!err);
      var payload = JSON.parse(results);
      assert(!payload.error);
      assert(payload.data.id === id);
      done();
    });
  });

  it('should return 404 if the id is not in the database', function(done){
    tu.get('/v1/reviews/5', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });

  it('should return 404 if the id is not in correct type', function(done){
    tu.get('/v1/reviews/asdf', function(error, results, res){
      assert(!error);
      assert(res.statusCode == 404);
      done();
    });
  });
});

describe('PATCH /v1/reviews/:id', function(){
  it('should update hidden is true', function(done){
    var review = {
      isHidden: true
    }
    tu.loginAsSales(function(error, user){
      tu.patch('/v1/reviews/' + 1, review, function(error, results, res){
        assert(!error);
        assert(res.statusCode == 200);
        tu.logout(function(){
          done();
        });
      });
    });
  });

});