if (typeof process.env.NODETIME_ACCOUNT_KEY != 'undefined' && process.env.NODETIME_ACCOUNT_KEY != 'undefined') {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'Magic',
    features:{ transactionProfiler: false } // TRANSACTION PROFILER MUST NOT BE ENABLED ON PROD!!! it leaks request headers
  });
}

var http = require('http');
var app = require(__dirname + '/app');
var config = require(__dirname + '/../config');

var server = http.createServer(app);
var port = config.http.port;

server.listen(port, function() {
});

process.on('uncaughtException', function(err) {
  console.log('received uncaught exception', err);
  console.log('shutting down worker');
  //TODO 
  // 1. this should be helped somewhat with domains
  // 2. usually setTimeout is a smell
  // 3. NEEDS TESTS
  var delay = 1000;
  var tid = setTimeout(function() {
    console.log('worker did not shutdown gracefully after', delay, 'forcing exit')
    process.exit(delay);
  }, delay);
  server.close(function() {
    clearTimeout(tid);
    process.exit(1);
  });
});
