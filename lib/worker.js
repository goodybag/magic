var log = require(__dirname + '/logger')({app: 'api', component: 'worker'});

if (typeof process.env.NODETIME_ACCOUNT_KEY != 'undefined' && process.env.NODETIME_ACCOUNT_KEY != 'undefined') {
  return;
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

process.once('uncaughtException', function(e) {
  console.log('uncaught exception', e)
  app.shutdown();
});

var worker = require('cluster').worker;
if(worker) {
  app.shutdown = function() {
    if(worker.disconnecting) return;
    worker.disconnecting = true;
    worker.disconnect();
  };

  worker.on('disconnect', function() {
    console.log('worker', 'received disconnect');
    require('pg').end();
  });
}
