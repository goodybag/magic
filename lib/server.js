
/**
 * Module dependencies
 */

var
  utils = require('./utils')

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

;

function createAppServer() {
  var app = express();
  app.sigterm = false;

  app.configure(function(){
    app.set('port', process.env.PORT || config.http.port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(config.cookieSecret));
    app.use(express.session({ store:new PGSessionStore(), secret:'todo -- come up with a good secret' }));

    /**
     * Request & Response prototype updates
     */
    app.response.error = function(error, details) {
      utils.sendError(this, error, details);
    }

    /**
     * Custom middleware
     */

    // Add a uuid to each request object
    app.use(uuid());

    // Add CORS headers
    app.use(corsHeaders);

    // Gracefully stop serving if SIGTERM was received
    app.use(function(req, res, next){
      if (!app.sigterm) return next();
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

  return app;
}

exports.createAppServer = createAppServer;