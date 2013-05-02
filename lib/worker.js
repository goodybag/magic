var logger = require(__dirname + '/logger');
var http = require('http');
var app = require(__dirname + '/app');
var config = require(__dirname + '/../config');

var meta = {app: 'api', component: 'worker' };
var log = logger(meta);

if (typeof process.env.NODETIME_ACCOUNT_KEY != 'undefined' && process.env.NODETIME_ACCOUNT_KEY != 'undefined') {
  return;
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'Magic',
    features:{ transactionProfiler: false } // TRANSACTION PROFILER MUST NOT BE ENABLED ON PROD!!! it leaks request headers
  });
}

var worker = require('cluster').worker;
var TAGS = ['worker'];
if(worker) {
  TAGS.push('worker' + worker.id);
  app.shutdown = function() {
    if(worker.disconnecting) return;
    log.warn(TAGS, 'disconnecting from master');
    worker.disconnecting = true;
    worker.disconnect();
  };

  worker.on('disconnect', function() {
    log.warn(TAGS, 'received disconnect message, closing database');
    require('pg').end();
  });
}


var server = http.createServer(app);
var port = process.env.MAGIC_PORT || config.http.port;

log.info(TAGS, 'attempting to listen on port '+ port);
server.listen(port, function() {
  log.info(TAGS, 'listening on port ' + port);
});

process.once('uncaughtException', function(e) {
  log.error(TAGS, 'uncaught exception', e);
  app.shutdown();
});

