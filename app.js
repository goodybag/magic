var cluster = require('cluster');

if (typeof process.env.NODETIME_ACCOUNT_KEY != 'undefined' && process.env.NODETIME_ACCOUNT_KEY != 'undefined') {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'Magic',
    features:{ transactionProfiler: false } // TRANSACTION PROFILER MUST NOT BE ENABLED ON PROD!!! it leaks request headers
  });
}

/**
 * Module dependencies
 */

var
// Built-in
  os = require('os')
, http = require('http')
, net = require('net')
, repl = require('repl')

// Configuration
, config = require('./config')

// Module vars
, workers = {} // Multiple workers per cluster
, numWorkers = 0
, httpServer
;

// Handle uncaught exceptions
process.on('uncaughtException', function (err){
  console.error('uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// :DEBUG: profiler
// var Profiler = require('clouseau');
// Profiler.enabled = true;
// Profiler.catchAll = false;
// Profiler.init({ displayInterval:0, useMicrotime:true });

// instantiate HTTP server
var app = require('./lib/app');
console.log("CPUs: "+ os.cpus().length);

/**
 * REPL
 */

if(config.repl.enabled && cluster.isMaster){
  net.createServer(function(socket){
    var r = repl.start({
      prompt: config.repl.prompt
    , input: socket
    , output: socket
    , terminal: true
    , useGlobal: false
    });

    r.context.app = app;
    r.context.socket = socket;
    r.context.cluster = cluster;

    r.on('exit', function(){
      socket.end();
    });
  }).listen(config.repl.port, function(){
    console.log("REPL started on port", config.repl.port);
  });
}

/**
 * Clustering
 */

if (cluster.isMaster){
  console.log("spawning");
  console.log("Master PID:", process.pid);

  var environmentVariables = {
    NODETIME_ACCOUNT_KEY: process.env.NODETIME_ACCOUNT_KEY
  };
  for (var i = 0, worker; i < os.cpus().length; i++){
    worker = cluster.fork(environmentVariables);
    workers[worker.pid] = worker;
    numWorkers++;

    worker.on('message', function(msg){
      console.log('msg received:', msg);
      if('HTTPTERM' === msg){
        numWorkers--; // Decrement number of workers (because we will exit)
        if(0 === numWorkers) process.exit(0);
      }
    });
  }
  cluster.on('death', function(worker){
    console.log('worker ' + worker.pid + ' died. spawning a new process...');
    delete workers[worker.pid];
    var newWorker = cluster.fork();
    workers[newWorker.pid] = newWorker;
  });
} else{
  httpServer = http.createServer(app).listen(config.http.port, function(){
    console.log('worker', cluster.worker.id+' (PID: ' + process.pid + '):', "Express server listening on port", config.http.port);
  });

  process.on('message', function(msg){
    if (msg === 'SIGTERM'){
      console.log('Shutting down worker: '+ cluster.worker.id + '(PID: ' + process.pid + ')');
      app.sigterm = true;
      httpServer.close(function(){
        console.log('HTTP SHUTDOWN -', process.pid);
        process.send('HTTPTERM');
      });
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', function(){
  console.log("Received SIGTERM, shutting down gracefully.");
  setTimeout(function(){
    console.log('Timeout reached, force shutting down all workers');
    process.exit(1);
  }, 1000 * 60);

  for(var id in cluster.workers){
    if (!cluster.workers.hasOwnProperty(id)) continue;
    cluster.workers[id].send('SIGTERM');
  }
});
