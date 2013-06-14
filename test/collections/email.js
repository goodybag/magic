var assert = require('better-assert');
var sinon = require('sinon');
var ok = require('okay');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');
var config = require('../../config');

describe('POST /v1/email', function() {
  describe('with valid post data', function() {
    var body = {
      to: 'test@goodybag.com',
      from: 'brian@goodybag.com',
      subject: 'subject!',
      body: 'hello!',
      cc: 'boom@example.com',
      bcc: 'bcc@goodybag.com'
    };
    var testSend = function(user, done) {
      var sent = false;
      utils.mail.once('send', function(msg) {
        assert(msg);
        assert(msg.to === body.to);
        assert(msg.from === body.from);
        assert(msg.html === body.body);
        assert(msg.subject === body.subject);
        assert(msg.cc == body.cc);
        assert(msg.bcc == body.bcc);
        sent = true;
      });
      tu.login(user, ok(done, function() {
        tu.post('/v1/email', body, ok(done, function(results, res) {
          assert(res.statusCode === 204);
          tu.logout(function() {
            assert(sent);
            done();
          });
        }));
      }));
    };
    describe('logged in as manager', function() {
      it('sends email', function(done) {
        var user = {email: 'some_manager@gmail.com', password: 'password'};
        testSend(user, done);
      });
    });

    describe('logged in as admin', function() {
      it('sends email', function(done) {
        testSend({email: 'admin@goodybag.com', password: 'password'}, done);
      });
    });

    describe('not logged in', function() {
      it('gives a 401', function(done) {
        tu.post('/v1/email', body, ok(done, function(results, res) {
          assert(res.statusCode === 401);
          done();
        }));
      });
    });
  });
});
