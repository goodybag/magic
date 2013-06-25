var http = require('http');
var request = require('request');
var omf = require('omf');
var _ = require('lodash');
var ok = require('okay');
var app = require('../lib/app');
var jsYaml = require('js-yaml');

var getServer = function(collection) {
  return require('../collections/' + collection + '/server');
};

var collections = [
  'businesses', 
  'locations', 
  'productCategories',
  'productTags',
  'products']
var getRoute = function(method, path) {
  var matchedRoutes = [];
  collections.forEach(function(collection){
    var server = getServer(collection);
    if(!server) throw new Error('Could not find server for collection ' + collection);
    //find route in server
    var methodRoutes = server.routes[method.toLowerCase()];
    var matches = methodRoutes.filter(function(route) {
      return route.match(path);
    });
    matchedRoutes = matchedRoutes.concat(matches);
  })
  if(!matchedRoutes.length) {
    throw new Error('Could find no route matching ' + method + ' ' + path);
  }
  if(matchedRoutes.length > 1) {
    var paths = _.pluck(matchedRoutes, 'path');
    throw new Error('Cannot determine matching route between ' + paths.join(', '));
  }
  return matchedRoutes.pop();
};

var testSecurity = module.exports = function(scenarios) {
  describe('security', function() {
    before(function(done) {
      this.server = http.createServer(app);
      this.server.listen(function() {
        this.port = this.server.address().port;
        done();
      }.bind(this));
    });

    var makeSuite = function(scenario) {
      scenario.statusCode = scenario.statusCode || 204;
      var suiteName = scenario.method + ' ' + scenario.path + ' as ' + (scenario.user || 'public');
      describe(suiteName, function() {
        before(function(done) {
          var route = this.route = getRoute(scenario.method, scenario.path);
          //replace actual route handler with fake handler
          this.actualHandler = route.callbacks.pop();
          route.callbacks.push(function(req, res) {
            return res.send(204);
          });
          var options = {
            json: { email: scenario.user, password: 'password' }
          };
          var url = 'http://localhost:' + this.port + '/v1/session';
          //reset the cookie jar
          request.defaults({jar: request.jar()});
          if(!scenario.user) {
            request.del(url, done);
          } else {
            request.post(url, options, ok(done, function(res) {
              if(res.statusCode != 200) {
                return done('Expected LOGIN status code of 200 but got ' + res.statusCode + ' for user ' + scenario.user);
              }
              done();
            }));
          }
        });

        it('receives status code ' + scenario.statusCode, function(done) {
          var options = {
            method: scenario.method,
            url: 'http://localhost:' + this.port + scenario.path
          };
          if(scenario.body) {
            options.json = scenario.body;
          }
          request(options, ok(done, function(res) {
            if(res.statusCode != scenario.statusCode) {
              console.log(res.body);
              return done('Expected status code ' + scenario.statusCode + ' but received ' + res.statusCode)
            }
            done();
          }));
        });

        after(function() {
          //reattach actual route handler
          this.route.callbacks.pop();
          this.route.callbacks.push(this.actualHandler);
        });
      });
    };

    _.each(scenarios, makeSuite);

    after(function(done) {
      this.server.close(done);
    });
  });

};
