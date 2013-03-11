var cluster = require('cluster');
var workerName = (cluster.isMaster) ? 'master' : ('worker '+cluster.worker.id);
if (process.env.NODETIME_ACCOUNT_KEY) {
  var hostName = require('os').hostname().slice(0,10) + '...';
  var now = new Date();
  var d = (now.getMonth()+1)+'/'+now.getDate()+' '+now.getHours()+':'+now.getMinutes();
  var profileLabel = 'Magic ['+d+'] @'+hostName+' '+workerName;

  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: profileLabel,
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
var Profiler = require('clouseau');
Profiler.enabled = true;
Profiler.catchAll = false;
Profiler.init({ displayInterval:0, useMicrotime:true });

// instantiate HTTP server
var app = require('./lib/server').createAppServer();

// import resources
app.use(require('./collections/debug/server'));
app.use(require('./collections/auth/server'));
app.use(require('./collections/charities/server'));
app.use(require('./collections/businesses/server'));
app.use(require('./collections/locations/server'));
app.use(require('./collections/products/server'));
app.use(require('./collections/productCategories/server'));
app.use(require('./collections/users/server'));
app.use(require('./collections/consumers/server'));
app.use(require('./collections/managers/server'));
app.use(require('./collections/cashiers/server'));
app.use(require('./collections/tapin-stations/server'));
app.use(require('./collections/groups/server'));
app.use(require('./collections/loyaltyStats/server'));
app.use(require('./collections/photos/server'));
app.use(require('./collections/productTags/server'));
app.use(require('./collections/reviews/server'));
app.use(require('./collections/redemptions/server'));
app.use(require('./collections/events/server'));

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

httpServer = http.createServer(app);
httpServer.listen(config.http.port, function(err){
  if(err) throw err;
  console.log("HTTP started on port", config.http.port);
});


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
