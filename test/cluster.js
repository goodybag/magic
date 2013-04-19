var assert = require('assert');

var async = require('async');
var omf = require('omf');

var master = require(__dirname + '/../lib/master');

var port = 10310;
describe('cluster', function() {
  describe('master', function() {
    before(function(done) {
      master.start(port, done);
    });

    omf('http://localhost:' + port, function(app) {
      app.get('/ping');

      for(var i = 0; i < 7; i++) {
        it('disconnects request on unhandled error', function(done) {
          //what I want to do here is issue a few error requests and a few
          //requests which should not error all at once.  The point is the
          //error requests should all error and the ping requests should all
          //200.  This tests that the shutdown/recycle behavior will not 
          //force-kill active requests
          var getError = function(cb) {
            app.request.get(app.url('/error'), function(err, res) {
              //TODO this will change to a response 500 after domains are added
              assert(err, 'should have received a node error');
              cb();
            });
          };
          var getPing = function(cb) {
            app.request.get(app.url('/ping'), function(err, res) {
              assert.equal(err, null, 'expected 200 status on ping request but got error ' + (err||0).stack)
              assert.equal(res.statusCode, 200, 'should have 200 status');
              cb();
            });
          };
          async.parallel([getError, getPing, getError, getPing], done);
        });
      }

      app.get('/ping');
    });

    after(function(done) {
      master.stop(done);
    });
  });
});