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
      db.api.requests.findOne({}, {order:'ORDER BY "createdAt" desc'}, function(err, obj) {
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
});
