var yaml = require('js-yaml');
var tu = require('../lib/test-utils');
var assert = require('better-assert');

function loadDescription(collection, cb) {
  var doc = require('fs').readFileSync('./collections/'+collection+'/description.yaml', 'utf8');
  yaml.loadAll(doc, cb);
}

function doChaos(doc) {
  var k;
  // fill path params
  var path = doc.resource.path;
  for (k in doc.resource.params) {
    path = path.replace(RegExp(':'+k,'ig'), doc.resource.params[k].eg);
  }
  describe('Chaos: '+doc.resource.path, function() {
    for (var method in doc.methods) {
      if (/delete/i.test(method)) { continue; } // cant do DELETE -- we need the test data
      (function(method) {

        it('should '+doc.methods[method].desc+' with valid input', function(done) {

          var request = {
            method: method.toUpperCase(),
            path: '/v1'+path,
            headers: {}
          };
          var payload = null;

          // add query params
          if (doc.methods[method].query) {
            var queryParams = [];
            for (k in doc.methods[method].query) {
              if (Array.isArray(doc.methods[method].query[k].eg)) {
                for (var i=0; i < doc.methods[method].query[k].eg.length; i++)
                  queryParams.push(k+'[]='+doc.methods[method].query[k].eg[i]);
              } else
                queryParams.push(k+'='+doc.methods[method].query[k].eg);
            }
            request.path += '?'+queryParams.join('&').replace(/ /g, '+');
          }

          // add body
          if (doc.methods[method].body) {
            payload = {};
            for (k in doc.methods[method].body)
              payload[k] = doc.methods[method].body[k].eg;
            payload = JSON.stringify(payload);
            request.headers['content-type'] = 'application/json';
          }

          var issueRequest = function(cb) {
            tu.httpRequest(request, payload, function(err, result, res) {
              if (res.statusCode !== 200)
                console.log('Failed chaos request'),
                  console.log(request),
                  console.log(payload),
                  console.log(res.statusCode),
                  console.log(result);
              assert(res.statusCode === 200);
              cb();
            });
          };

          // login, if needed
          if (doc.methods[method].auth && doc.methods[method].auth.required) {
            tu.login(doc.methods[method].auth.eg, function() {
              issueRequest(function(){ tu.logout(done); });
            });
          } else {
            issueRequest(done);
          }
          
        });
      })(method);
    }
  });
}

loadDescription('businesses', doChaos);