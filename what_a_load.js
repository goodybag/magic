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
var totalRequests = requestQueue.length, numDispatched = 0, nextTick = totalRequests / 20, percentDone = 0;
var currentRequest;
function issueNextRequest() {
  if ((numDispatched++) > nextTick) {
    nextTick += totalRequests / 20;
    percentDone += 5;
    console.log(percentDone + '%');
  }
  var request = requestQueue.shift();
  if (request) {

    // start tracking request
    currentRequest = {
      id: 'request-'+stats.requests.length,
      desc: request.desc
    };
    stats.requests.push(currentRequest);

    dispatchRequest(request.authCreds, request.requestDoc, function(res, profile) {
      // stats
      stats.codes[res.statusCode] = ((stats.codes[res.statusCode] || 0) + 1);
      currentRequest.profile = profile;

      // output
      if (res.statusCode != 200) {
        if (verbose)
          console.log(' *',request.desc, '- Received non-ok response:', res.statusCode);
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
  
  var numRequests = stats.requests.length;

  function StatsTracker(mystat) {
    this.mystat = mystat;
    this.total = 0;
    this.bestTime = 100000;
    this.bestTimeIndex = -1;
    this.worstTime = 0;
    this.worstTimeIndex = -1;
    this.distribution = { 2000:[], 1500:[], 1250:[], 1000:[], 750:[], 500:[], 300:[], 200:[], 100:[], 60:[], 30:[], 20:[], 10:[], 5:[], 1:[] };
  }
  StatsTracker.prototype.consume = function(profile, desc) {
    this.total += profile[this.mystat];

    if (this.worstTime < profile[this.mystat]) { this.worstTime = profile[this.mystat], this.worstTimeIndex = i; }
    if (this.bestTime > profile[this.mystat]) { this.bestTime = profile[this.mystat], this.bestTimeIndex = i; }

    var distRange = profile[this.mystat] * 1000;
    for (var k in this.distribution) {
      if (distRange < parseFloat(k,10)) {
        this.distribution[k].push(desc);
        break;
      }
    }
  }
  StatsTracker.prototype.log = function() {
    console.log(this.mystat.slice(0,1).toUpperCase() + this.mystat.slice(1));
    console.log(' * Elapsed:', Profiler.formatElapsedTime(this.total));
    console.log(' * Average:', Profiler.formatElapsedTime(this.total / stats.requests.length));
    console.log(' * Best:', Profiler.formatElapsedTime(this.bestTime), '('+stats.requests[this.bestTimeIndex].desc+')');
    console.log(' * Worst:', Profiler.formatElapsedTime(this.worstTime), '('+stats.requests[this.worstTimeIndex].desc+')');
    console.log(' * Distribution:');
    for (var range in this.distribution)
      if (this.distribution[range].length)
        console.log('   <', range, 'ms:', this.distribution[range].length);
  }

  var totalResults = new StatsTracker('total');
  var connectResults = new StatsTracker('connect');
  var processResults = new StatsTracker('process');
  var respondResults = new StatsTracker('respond');
  for (var i=0; i < numRequests; i++) {
    totalResults.consume(stats.requests[i].profile, stats.requests[i].desc);
    connectResults.consume(stats.requests[i].profile, stats.requests[i].desc);
    processResults.consume(stats.requests[i].profile, stats.requests[i].desc);
    respondResults.consume(stats.requests[i].profile, stats.requests[i].desc);
  }
  console.log('# of Requests:', numRequests);
  totalResults.log();
  connectResults.log();
  processResults.log();
  respondResults.log();
}


// helpers
// =======
function login(user, callback) {
  tu.httpRequest({ hostname: host, port: port, method: 'post', path: '/v1/session', headers: { 'content-type': 'application/json' } }, JSON.stringify(user), callback);
}
function logout(callback) {
  tu.httpRequest({ hostname: host, port: port, method:'delete', path: '/v1/session' }, null, callback);
}
var cookie;
function dispatchRequest(authCreds, requestDoc, cb) {

  var doRequest = function(err, payload, res) {
    if (res && res.statusCode !== 200) { console.log('Login Failed:', payload); }

    var options = requestDoc.toOptions();
    options.hostname = host;
    options.port = port;
    options.accept   = options.accept || 'application/json';
    options.headers  = options.headers || {};
    options.headers.cookie = cookie || "";

    var requestProfile = {
      ticks: {
        start: Profiler.getTick(),
        connected: 0,
        receivedData: 0,
        finished: 0
      },
      times: {
        connect: 0,
        process: 0,
        respond: 0,
        total: 0
      }
    };

    var req = require('http').request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        if (!requestProfile.ticks.receivedData)
          requestProfile.ticks.receivedData = Profiler.getTick();
      });
      res.on('end', function() { 
        if (!requestProfile.ticks.receivedData)
          requestProfile.ticks.receivedData = Profiler.getTick();
        requestProfile.ticks.finished = Profiler.getTick();

        requestProfile.times.connect = requestProfile.ticks.connected - requestProfile.ticks.start;
        requestProfile.times.process = requestProfile.ticks.receivedData - requestProfile.ticks.connected;
        requestProfile.times.respond = requestProfile.ticks.finished - requestProfile.ticks.receivedData;
        requestProfile.times.total   = requestProfile.ticks.finished - requestProfile.ticks.start;

        if (authCreds) {
          logout(function() { cb(res, requestProfile.times); });
        } else {
          cb(res, requestProfile.times);
        }
      });

      // Set cookie
      if (res.headers['set-cookie']){
        // For now, just be dumb and set the whole cookie - whatever
        cookie = res.headers['set-cookie'][0].split(';')[0];
      }
    });
    req.on('socket', function(socket) {
      socket.on('connect', function() {
        requestProfile.ticks.connected = Profiler.getTick();
      });
    });
    req.on('error', function(e) {
      console.log('REQUEST ERROR', e)
      cb(e);
    });
    if (payload) {
      req.write(payload);
    }
    req.end();
  };

  if (authCreds) {
    login(authCreds, doRequest);
  } else {
    doRequest();
  }
}
