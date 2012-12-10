
/**
 * Module dependencies
 */

var
// Built-in
  os = require('os')
, fs = require('fs')
, path = require('path')
, cluster = require('cluster')
, http = require('http')
, net = require('net')
, repl = require('repl')

// Configuration
, config = require('./config.json')

// Logging
, winston = require('winston')
, expressWinston = require('express-winston')
, expressLogger = require('./express-logger')
, FileRotate = require('./file-rotate')

// Express
, express = require('express')
, uuid = require('./middleware/uuid')
, routes = require('./routes')

// Module vars
, workers = {} // Multiple workers per cluster
, numWorkers = 0
, httpServer
, sigterm = false // Did we recieve a sigterm
;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || config.http.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());

  /**
   * Custom middleware
   */

  // Add a uuid to each request object
  app.use(uuid());

  // Gracefully stop serving if SIGTERM was received
  app.use(function(req, res, next){
    if (!sigterm) return next();
    res.setHeader("Conection", "close");
    res.send(502, "Server is in the process of restarting");
  });

  // Custom logger for express
  app.use(expressLogger({
    meta: {tag: 'api-express'}
  , transports: [
      new FileRotate({
        json: true
      , filename: 'all.log'
      , dirname: 'logs'
      })
    ]
  }));

  app.use(app.router);

  // Configure the error logger
  app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true
      })
    ]
  }))
});

// Development environment specific configuration settings for express
app.configure('development', function(){
  app.use(express.errorHandler({
    dumpExceptions: true
  , showStack: true
  }));
});

// Routes stuff goes here

app.get('/businesses', routes.v1.businesses.list);

app.get('/health', function(req, res){
  res.send({
      pid: process.pid
    , memory: process.memoryUsage()
    , uptime: process.uptime()
  });
});


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
      sigterm = true;
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
