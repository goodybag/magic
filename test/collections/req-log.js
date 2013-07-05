var
  assert  = require('better-assert')
, sinon   = require('sinon')
, utils   = require('./../../lib/utils')
, tu      = require('./../../lib/test-utils')
, config  = require('./../../config')
, db      = require('./../../db')

, baseUrl = config.baseUrl
;

describe('GET /v1', function() {
  it('should log the request without userId or application header', function(done) {
    var state = Math.random().toString();
    tu.get('/v1?state=' + state, function(err, payload, res) {
      db.copper.requests.findOne({}, {order:'ORDER BY "createdAt" desc'}, function(err, obj) {
        console.log(err);
        assert(err == null);
        assert(obj != null);

        assert(typeof obj['uuid'] === 'string');
        assert(obj['userId'] == null);
        assert(obj['httpMethod'] === 'GET');
        assert(obj['url'] === '/v1?state=' + state);
        assert(obj['application'] == null);
        assert(obj['userAgent'] === 'magic-test-utils');

        var createdAt = new Date(obj['createdAt'] + ' GMT');
        assert(createdAt instanceof Date);
        assert(!isNaN(createdAt.getDate()));
        done();
      });
    });
  });

  it('should make a tapin-auth like request and use the users id as the userId rather than tapin station id', function(done){
    tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
      assert(!error);

      tu.tapinAuthRequest('POST', '/v1/products/3/feelings', '432123-ZZC', { isLiked: true }, function(error, payload, res){
        assert(res.statusCode == 200);
        payload = JSON.parse(payload);
        var uid = payload.meta.userId;

        db.copper.requests.findOne({}, {order:'ORDER BY "createdAt" desc'}, function(err, obj) {
          assert(!error);
          assert(obj.userId == uid);
          tu.logout(done);
        });
      });
    });
  });
});
