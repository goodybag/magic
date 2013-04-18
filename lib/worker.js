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
var port = process.env.MAGIC_PORT || config.http.port;

server.listen(port, function() {
  console.log('listening on', port);
});

var worker = require('cluster').worker;
process.on('uncaughtException', function(err) {
  console.log(worker.id, '- received uncaught exception', err);
  console.log(worker.id, '- closing server');
  // the timeout and force-kill should
  // not happen unless the web client is still
  // trying to get data. once domains are used
  // we can 500 the client & get it to disconnect faster
  var delay = 1000;
  var tid = setTimeout(function() {
    console.log(worker.id, '- worker did not shutdown gracefully after', delay, 'forcing exit')
    process.exit(delay);
  }, delay);
  //don't double-close the server
  if(server.closing) return;
  server.closing = true;
  server.close(function() {
    console.log(worker.id, '- server closed');
    clearTimeout(tid);
    process.exit(1);
  });
});
