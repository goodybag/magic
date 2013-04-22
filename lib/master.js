//the master process which is responsible for forking workers
var cluster = require('cluster');
var os = require('os');

var async = require('async');

var workerCount = os.cpus().length;


if(!cluster.isMaster) {
  throw new Error("Attempted to start the cluster master process from a non-master context.");
}

if (typeof process.env.NODETIME_ACCOUNT_KEY != 'undefined' && process.env.NODETIME_ACCOUNT_KEY != 'undefined') {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'Magic',
    features:{ transactionProfiler: false } // TRANSACTION PROFILER MUST NOT BE ENABLED ON PROD!!! it leaks request headers
  });
}

cluster.setupMaster({
  exec: __dirname + '/worker.js'
});

cluster.on('fork', function(worker) {
  console.log('forked worker with ID:', worker.id, 'PID:', worker.process.pid);
});

cluster.on('online', function(worker) {
  console.log('worker', worker.id,'online');
});

cluster.on('listening', function(worker, address) {
  console.log('worker', worker.id, 'listening on', address);
});

cluster.on('disconnect', function(worker) {
  console.log('worker', worker.id, 'disconnected');
});

cluster.on('exit', function(worker, code, signal) {
  console.log('worker', worker.id, 'has exited with CODE:', code, 'SIGNAL:', signal);
});

var shutdown = function() {
  console.log('master shutting down');
  console.log('disconnecting workers');
  cluster.disconnect();
  process.stdin.end();
};

var respawn = function(worker) {
  spawn(function(worker) {
  });
  console.log('master','disconnecting worker', worker.id);
  worker.disconnect();
};

process.stdin.on('readable', function() {
  if(process.stdin.read()) {
    for(var id in cluster.workers) {
      respawn(cluster.workers[id]);
    }
  }
});

//ctrl-c will send this
process.on('SIGINT', function() {
  console.log('received SIGINT');
  shutdown();
});

//heroku will send this
process.on('SIGTERM', function() {
  console.log('received SIGTERM');
  shutdown();
});

var spawn = function(cb) {
  var worker = cluster.fork();
  worker.once('listening', function() {
    worker.once('message', function() {
      respawn(worker);
    });
    cb(null, worker);
  });
};

//these control methods (start/stop) are exported
//so they can be accessed via test harness
module.exports = {
  start: function(port, cb) {
    var listeningCount = 0;
    if(typeof port === 'function') {
      cb = port;
    } else if (typeof cb === 'function'){
      //allow setting of the port
      //in test scenarios
      process.env.MAGIC_PORT = process.env.MAGIC_PORT || port;
    }
    console.log('starting cluster master with', workerCount, 'workers');
    console.log('master PID:', process.pid);
    async.times(workerCount, function(num, cb) { spawn(cb); }, cb || function() {});
  },
  stop: function(cb) {
    cluster.disconnect(cb);
  }
};
