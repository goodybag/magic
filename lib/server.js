
/**
 * Module dependencies
 */

var
  utils = require('./utils')
, fs    = require('fs')

// Configuration
, config = require('../config')

// Logging
, winston = require('winston')
, expressWinston = require('express-winston')
, expressLogger = require('./express-logger')
, FileRotate = require('./file-rotate')

// Express
, express = require('express')
, uuid = require('../middleware/uuid')
, corsHeaders = require('../middleware/cors')
, PGSessionStore = require('./pgsessionstore')
, tapinAuth = require('../middleware/tapin-auth')
, dump = require('../middleware/dump')

, magic = require('./magic')
, events = utils.requireDir('./../events', { relativeToProcess: false })
;
require('js-yaml') // adds .yaml parsing to require()

function createAppServer() {
  var app = express();
  app.sigterm = false;

  app.configure(function(){
    app.set('port', process.env.PORT || config.http.port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());

    app.use(function(req, res, next){
      if (!req.header('Content-Type') || req.header('Content-Type') == 'text/html'|| req.header('Content-Type') == 'text/plain'){
        req.headers['Content-Type'] = 'application/json';
        if (typeof req.body == 'string') req.body = JSON.parse(req.body);
      }
      res.header('Content-Type', 'application/json');
      next();
    });

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // Add a uuid to each request object
    app.use(uuid());

    app.use(dump);

    // Add CORS headers
    app.use(corsHeaders);

    app.use(express.cookieParser(config.cookieSecret));
    app.use(express.session({
      store:  new PGSessionStore()
    , secret: 'todo -- come up with a good secret'
    , cookie: { maxAge: new Date(3000, 0, 1) }
    }));
    // app.use(express.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

    /**
     * Request & Response prototype updates
     */
    app.response.error = function(error, details) {
      utils.sendError(this, error, details);
    };
    app.response.noContent = function() {
      this.status(204).send('{}').end();
    };

    // Gracefully stop serving if SIGTERM was received
    app.use(function(req, res, next){
      if (!app.sigterm) return next();
      res.setHeader("Conection", "close");
      res.send(502, "Server is in the process of restarting");
    });

    // Allow Temporary authentication via tapins
    app.use(tapinAuth);

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
    }));
  });

  // Register Events
  for (var group in events){
    for (var channel in events[group]){
      console.log("register event: ", channel);
      magic.on(channel, events[group][channel]);
    }
  }

  // Development environment specific configuration settings for express
  app.configure('development', function(){
    app.use(express.errorHandler({
      dumpExceptions: true
    , showStack: true
    }));
  });

  app.get('/crossdomain.xml', function(req, res){
    res.header('Content-Type', 'text/xml');
    res.send(
      '<?xml version="1.0" ?>'
    + '<cross-domain-policy>'
    + '  <allow-http-request-headers-from domain="*" headers="*"/>'
    + '  <allow-access-from domain="*" />'
    + '</cross-domain-policy>'
    );
  });

  app.get('/proxy.html', function(req, res){
    res.header('Content-Type', 'text/html');

    fs.readFile(process.cwd() + '/proxy.html', 'utf-8', function(error, result){
      if (error) return res.send(404);

      var page = req.header('referer');

      if (!page || page.indexOf('/') == -1) result = result.replace('{{page}}', '');
      else result = result.replace('{{page}}', page.substring(page.lastIndexOf('/') - 1));

      res.send(result);
    });
  });

  return app;
}

exports.createAppServer = createAppServer;
