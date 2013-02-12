var yaml = require('js-yaml');
var tu = require('../lib/test-utils');
var assert = require('better-assert');

function loadDescription(collection, cb) {
  var doc = require('fs').readFileSync('./collections/'+collection+'/description.yaml', 'utf8');
  yaml.loadAll(doc, cb);
}

function buildBaseRequest(method, path) {
  return {
    method: method.toUpperCase(),
    path: '/v1'+path,
    headers: {}
  };
}

function badValue(type) {
  switch (type) {
    case 'string*':
    case 'string':
    case 'url':
      return 123456789;
    case 'int':
      return 'CORRUPTION STRING';
  }
}

function buildPayload(bodyDesc, badIndex) {
  var payload = {};
  var i = 0;
  for (var k in bodyDesc) {
    if (i++ === badIndex)
      payload[k] = badValue(bodyDesc[k].type);
    else
      payload[k] = bodyDesc[k].eg;
  }
    
  return JSON.stringify(payload);
}

function buildQuerystring(queryDesc, badIndex) {
  var queryParams = [];
  var i = 0;
  for (var k in queryDesc) {
    if (i++ === badIndex) {
      queryParams.push(k+'='+badValue(queryDesc[k].type));
    } else {
      if (Array.isArray(queryDesc[k].eg)) {
        for (var j=0; j < queryDesc[k].eg.length; j++)
          queryParams.push(k+'[]='+queryDesc[k].eg[j]);
      } else
        queryParams.push(k+'='+queryDesc[k].eg);
    }
  }
  return '?'+queryParams.join('&').replace(/ /g, '+');
}

function loginWrapper(auth, cb) {
  if (auth && auth.required) {
    tu.login(auth.eg, cb);
  } else {
    cb();
  }
}

function doRequest(request, payload, expectedStatus, cb) {
  tu.httpRequest(request, payload, function(err, result, res) {
    if (res.statusCode !== expectedStatus)
      console.log('Failed chaos request'),
        console.log(request),
        console.log(payload),
        console.log(res.statusCode),
        console.log(result);
    assert(res.statusCode === expectedStatus);
    cb();
  });
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

        it('should respond 200 on '+doc.methods[method].desc+' with valid input', function(done) {

          var payload = null;
          var request = buildBaseRequest(method, path);

          if (doc.methods[method].query)
            request.path += buildQuerystring(doc.methods[method].query);
          
          if (doc.methods[method].body) {
            payload = buildPayload(doc.methods[method].body);
            request.headers['content-type'] = 'application/json';
          }

          loginWrapper(
            doc.methods[method].auth,
            function(err, user) { 
              doRequest(request, payload, 200, function() {
                if (user) tu.logout(done);
                else done();
              });
            }
          );
        });

        var numAttr = 0,
          attrs = (method == 'get') ? doc.methods[method].query : doc.methods[method].body,
          attrKeys = [];
        if (attrs) {
          attrKeys = Object.keys(attrs);
          numAttr = attrKeys.length;
        }

        for (var i=0; i < numAttr; i++) {
          (function(i) {

            if (attrs[attrKeys[i]].type == 'any' || attrs[attrKeys[i]].type == 'any*') {
              return; // can't corrupt the permissive
            }

            it('should respond 400 on '+doc.methods[method].desc+' with invalid input', function(done) {

              var payload = null;
              var request = buildBaseRequest(method, path);

              if (doc.methods[method].query && method == 'get') {
                request.path += buildQuerystring(doc.methods[method].query, i);
              }
                
              if (doc.methods[method].body && method != 'get') {
                payload = buildPayload(doc.methods[method].body, i);
                request.headers['content-type'] = 'application/json';
              }

              loginWrapper(
                doc.methods[method].auth,
                function(err, user) { 
                  doRequest(request, payload, 400, function() {
                    if (user) tu.logout(done);
                    else done();
                  });
                }
              );
            });

          })(i);
        }

      })(method);
    }
  });
}

loadDescription('businesses', doChaos);