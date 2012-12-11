var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('./test-utils');

describe('GET /v1/businesses', function() {
  it('should respond with a business listing', function(done) {
    tu.get('/v1/businesses', function(err, payload, res) {

      payload = JSON.parse(payload);

      assert(!payload.error);
      assert(payload.data.length == 3);
      assert(payload.data[0].id, 1);
      assert(payload.data[0].name, 'Foobar');
      assert(payload.data[0].street1, '1234 Asdf St');
      assert(payload.data[0].street2, '#5');
      assert(payload.data[0].city, 'Austin');
      assert(payload.data[0].state, 'TX');
      assert(payload.data[0].zip, 78701);
      assert(payload.data[0].enabled, true);
      done();
    });
  });
});