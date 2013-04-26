var assert = require('assert');

var async = require('async');
var omf = require('omf');
var ok = require('okay');

var master = require(__dirname + '/../lib/master');

var port = 10310;
describe('cluster', function() {
  describe('master', function() {
    before(function(done) {
      master.start(port, done);
    });

    omf('http://localhost:' + port, function(app) {
      app.get('/ping');
      app.get('/ping');

      it('gets failures and successes', false, function(done) {
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
        //app.get('/error', 500);
      }

      var getProducts = function(num, cb) {
        app.request.get(app.url('/v1/products'), function(err, res) {
          if(err) return cb(err);
          if(res.statusCode != 200) return cb(new Error('GOT STATUS CODE ' + res.statusCode));
          cb();
        })
      }

      var getUrl = function(url) {
        return function(num, cb) {
          app.request.get(app.url(url), function(err, res) {
            if(err) return cb(err);
            if(res.statusCode != 200) return cb(new Error('GOT STATUS CODE ' + res.statusCode));
            cb();
          });
        };
      }

      var check = function(cb) {
        return function(err, res) {
          if(err) return cb(err);
          if(res.statusCode != 200) return cb(new Error('GOT STATUS CODE ' + res.statusCode));
          cb(null, res);
        }
      };
      var login = function(cb) {
        var url = app.url('/v1/session');
        var data = {
          json: {
            email: 'tapin_station_0@goodybag.com',
            password: 'password'
          }
        };
        app.request.post(url, data, check(cb));
      }

      var tapin = function(cb) {
        var headers = {
          'authorization': 'Tapin ' + '667788-CBA'
        };
        var data = {
          headers: headers
        };
        app.request.get(app.url('/v1/session'), data, check(cb));
      }

      it('gets tapin', function(done) {
        var doTapin = function(num, cb) {
          tapin(cb)
        }
        login(ok(function() {
          async.times(100, doTapin, done);
        }))
      });

      it('gets a lot of products', function(done) {
        require('http').globalAgent.maxSockets = 40;
        async.times(100, getUrl('/v1/products'), function(err) {
          console.log('got product 100 times')
          done(err);
        });
      });

    });

    after(function(done) {
      this.timeout(5000);
      setTimeout(function() {
        master.stop(done);
      }, 1000);
    });
  });
});
