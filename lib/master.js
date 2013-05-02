//this has to be the first line, according to nodetime documentation
if (typeof process.env.NODETIME_ACCOUNT_KEY != 'undefined' && process.env.NODETIME_ACCOUNT_KEY != 'undefined') {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'Magic',
    features:{ transactionProfiler: false } // TRANSACTION PROFILER MUST NOT BE ENABLED ON PROD!!! it leaks request headers
  });
}

//the master process which is responsible for forking workers
var cluster = require('cluster');

var async = require('async');

var log = require(__dirname + '/logger')('master')
var config = require(__dirname + '/../config');

var workerCount = config.numWorkers;

if(!cluster.isMaster) {
  throw new Error("Attempted to start the cluster master process from a non-master context.");
}

cluster.setupMaster({
  exec: __dirname + '/worker.js'
});

cluster.on('fork', function(worker) {
  log.info(['worker' + worker.id], 'forked worker');
});

cluster.on('online', function(worker) {
  log.info(['worker' + worker.id], 'worker online');
});

cluster.on('disconnect', function(worker) {
  log.warn(['worker' + worker.id], 'disconnected');
});

cluster.on('exit', function(worker, code, signal) {
  log.warn(['worker', + worker.id], 'has exited with CODE: '+ code + ' SIGNAL: ' + signal);
});

//ctrl-c will send this
process.on('SIGINT', function() {
  log.warn('received SIGINT');
  master.stop();
});

//heroku will send this
process.on('SIGTERM', function() {
  log.warn('received SIGTERM');
  master.stop();
});

var spawn = function(cb) {
  var worker = cluster.fork();
  worker.once('listening', function(ip) {

    log.info(['worker' + worker.id], 'listening on ' + ip.address + ' ' + ip.port);
    //auto-restart workers
    worker.once('disconnect', function() {
      if(master.stopping) return;
      log.info('automatically respawning another worker');
      spawn(function(err, worker) {
        if(master.stopping) {
          worker.disconnect();
        }
      });
    });
    if(cb) {
      cb(null, worker);
    }
  });
};

//these control methods (start/stop) are exported
//so they can be accessed via test harness
var master = module.exports = {
  stopping: false,
  start: function(port, cb) {
    var listeningCount = 0;
    if(typeof port === 'function') {
      cb = port;
    } else if (typeof cb === 'function'){
      //allow setting of the port
      //in test scenarios
      process.env.MAGIC_PORT = process.env.MAGIC_PORT || port;
    }
    log.info('starting cluster master with ' + workerCount + ' workers');
    async.times(workerCount, function(num, cb) { spawn(cb); }, cb || function() {});
  },
  stop: function(cb) {
    this.stopping = true;
    log.warn('stopping master');
    cluster.disconnect(cb);
  }
};
