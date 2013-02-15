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
  console.log('  node what_a_load.js [--host/-h localhost] [--port/-p 80] [--methods/-m GET,POST,PUT] [--numrequests/-n 10] <server_description_path>');
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
// enable profiler
var Profiler = require('clouseau');
Profiler.enabled = true;

var stats = {
  codes:{},
  requests:[],
};
var currentRequest;
function issueNextRequest() {
  var request = requestQueue.shift();
  if (request) {

    // start tracking request
    currentRequest = {
      id: 'request-'+stats.requests.length,
      desc: request.desc
    };
    Profiler.enter(currentRequest.id);
    stats.requests.push(currentRequest);

    dispatchRequest(request.authCreds, request.requestDoc, function(res, payload) {
      // stats
      stats.codes[res.statusCode] = ((stats.codes[res.statusCode] || 0) + 1);
      Profiler.exit();
      currentRequest.profile = Profiler.totals[currentRequest.id];

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

  } else
    outputResults();
}

console.log('');
console.log('Dropping load...');
issueNextRequest();

// analyze results
// ===============
function outputResults() {
  console.log('Responses');
  console.log('---------');
  
  for (var code in stats.codes)
    console.log(' * status',code,'response',stats.codes[code],'times');

  console.log('');
  console.log('Performance');
  console.log('-----------');
  
  var total = 0;
  var numRequests = stats.requests.length;
  var bestTime = 100000, bestTimeIndex = -1;
  var worstTime = 0, worstTimeIndex = -1;
  var distribution = { 2000:[], 1500:[], 1250:[], 1000:[], 750:[], 500:[], 300:[], 200:[], 100:[], 60:[], 30:[], 20:[], 10:[] };
  for (var i=0; i < numRequests; i++) {
    var elapsed = stats.requests[i].profile.elapsed;
    total += elapsed;
    if (worstTime < elapsed) { worstTime = elapsed, worstTimeIndex = i; }
    if (bestTime > elapsed) { bestTime = elapsed, bestTimeIndex = i; }
    var distRange = elapsed * 1000;
    for (var k in distribution) {
      if (distRange < parseFloat(k,10)) {
        distribution[k].push(stats.requests[i].desc);
        break;
      }
    }
  }
  console.log(' * Total Time Elapsed:', Profiler.formatElapsedTime(total));
  console.log(' * Total # of Requests:', numRequests);
  console.log(' * Average Response Time:', Profiler.formatElapsedTime(total / stats.requests.length));
  console.log(' * Best Response Time:', Profiler.formatElapsedTime(bestTime), '('+stats.requests[bestTimeIndex].desc+')');
  console.log(' * Worst Response Time:', Profiler.formatElapsedTime(worstTime), '('+stats.requests[worstTimeIndex].desc+')');
  console.log(' * Response distribution:');
  for (var range in distribution)
    if (distribution[range].length)
      console.log('   <', range, 'ms:', distribution[range].length);
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
