/**
 * what_a_load.js: wide-coverage HTTP request load testing
 */

require('js-yaml');
var tu = require('./lib/test-utils');
var doci = require('./lib/doci');

// cli args helpers
var getArg = function(option, fallback){
  var pos = process.argv.indexOf(option);
  if (pos === -1) return fallback;
  var v = process.argv[pos + 1];
  process.argv.splice(pos, 2); // remove from argv, so we don't misinterpret them later
  return v;
};
var getFlag = function(option, fallback){
  var pos = process.argv.indexOf(option);
  if (pos === -1) return fallback;
  process.argv.splice(pos, 1); // remove from argv, so we don't misinterpret it later
  return true;
};
function usage() {
  console.log('Usage:');
  console.log('  node what_a_load.js [--host/-h localhost] [--port/-p 80] <server_description_path>');
}

// prepare
// =======
var verbose = getFlag('-v') || getFlag('--verbose', false);
var host = getArg('--host') || getArg('-h', 'localhost');
var port = getArg('--port') || getArg('-p', 80);
var allowedMethods = (getArg('--methods') || getArg('-m', 'GET,POST,PUT')).split(',').map(function(x) { return x.trim().toUpperCase(); });
var numRequests = getArg('-n') || getArg('--numrequests', 10);

var serverDocPath = process.argv[process.argv.length - 1];
if (serverDocPath.indexOf('what_a_load.js') !== -1) {
  console.log('error: Need a server description file to generate requests.');
  usage();
  return;
}
var serverDoc;
try { serverDoc = require(serverDocPath); }
catch (e) {
  console.log('error: Unable to find server description file at given path of "'+serverDocPath+'"');
  usage();
  return;
}

console.log('Preparing a load from '+serverDocPath);
console.log(' --hostname: '+host);
console.log(' --port: '+port);
console.log(' --methods: '+allowedMethods.join(','));
console.log(' --numrequests: '+numRequests);
console.log(' --verbose: '+verbose);

var resources = [];
for (var k in serverDoc) {
  resources.push(new doci.Resource(serverDoc[k]));
}
var requestQueue = [];
resources.forEach(function(resource) {
  resource.iterateMethods(function(methodDoc) {

    if (allowedMethods.indexOf(methodDoc.methodName.toUpperCase()) === -1)
      return;

    for (var i=numRequests; i--;) {
      requestQueue.push({
        desc: methodDoc.getDesc(),
        authCreds: (methodDoc.needsAuth()) ? methodDoc.getAuthCreds() : false,
        requestDoc: methodDoc.makeRequestDoc()
      });
    }
  });
});

// issue requests
// ==============
var stats = {
  codes:[]
};
function issueNextRequest() {
  var request = requestQueue.shift();
  if (request)
    dispatchRequest(request.authCreds, request.requestDoc, function(res, payload) {
      // stats
      stats.codes[res.statusCode] = ((stats.codes[res.statusCode] || 0) + 1);
      // output
      if (res.statusCode != 200) {
        if (verbose)
          console.log(' *',request.desc, '- Received non-ok response:', res.statusCode, payload);
      } else {
        if (verbose)
          console.log(' *',request.desc, '- 200 ok');
      }
      // continue
      issueNextRequest();
    });
  else
    outputResults();
}

console.log('');
console.log('Dropping load...');
issueNextRequest();

// analyze results
// ===============
function outputResults() {
  console.log('');
  console.log('Responses');
  console.log('---------');
  for (var code in stats.codes)
    console.log(' * status',code,'response',stats.codes[code],'times');
}


// helpers
// =======
function login(user, callback) {
  tu.httpRequest({ hostname: host, port: port, method: 'post', path: '/v1/session', headers: { 'content-type': 'application/json' } }, JSON.stringify(user), callback);
}
function logout(callback) {
  tu.httpRequest({ hostname: host, port: port, method:'delete', path: '/v1/session' }, null, callback);
}
function dispatchRequest(authCreds, requestDoc, cb) {
  var doRequest = function(err, payload, res) {
    if (res && res.statusCode !== 200) { console.log('Login Failed:', payload); }
    var options = requestDoc.toOptions();
    options.hostname = host;
    options.port = port;
    tu.httpRequest(options, requestDoc.toPayload(), function(err, payload, res) {
      if (authCreds) {
        logout(function() { cb(res, payload); });
      } else {
        cb(res, payload);
      }
    });
  };

  if (authCreds) {
    login(authCreds, doRequest);
  } else {
    doRequest();
  }
}
