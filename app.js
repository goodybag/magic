
/**
 * Module dependencies
 */

var
// Built-in
  cluster = require('cluster')
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

var app = require('./lib/server').createAppServer();

/**
 * REPL
 */

if(cluster.isMaster){
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

  // Handle uncaught exceptions
  process.on('uncaughtException', function (err){
    console.error('uncaughtException:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
}

httpServer = http.createServer(app).listen(app.get('port'), function(){
});

return;

/**
 * Clustering
 */

if (cluster.isMaster){
  console.log("spawning");
  console.log("Master PID:", process.pid);

  for (var i = 0, worker; i < os.cpus().length; i++){
    worker = cluster.fork();
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
  httpServer = http.createServer(app).listen(app.get('port'), function(){
    console.log('worker', cluster.worker.id+' (PID: ' + process.pid + '):', "Express server listening on port", app.get('port'));
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
