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

      it('gets failures and successes', function(done) {
        var paths = ['/ping', '/error', '/ping', '/error'];
        paths = paths.concat(paths.concat(paths))
        paths = paths.concat(paths.concat(paths))
        paths = paths.concat(paths.concat(paths))
        var req = function(path, cb) {
          var url = app.url(path);
          app.request.get(url, function(err, res) {
            if(err) return cb(err);
            if(path === '/error') {
              if(res.statusCode != 500) {
                return cb(new Error("Weird /error status code"));
                console.log('/error 500');
              }
              return cb(null);
            }
            if(res.statusCode != 200) {
              return cb(new Error("Weird /ping status code"));
            }
            console.log('/ping 200');
            return cb(null);
          });
        };
        async.forEach(paths, req, done);
      });

      for(var i = 0; i < 5; i++) {
        app.get('/error', 500);
      }

    });

    after(function(done) {
      master.stop(done);
    });
  });
});
