
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
, requestLogger = require('../middleware/request-logger')

// Express
, express = require('express')
, uuid = require('../middleware/uuid')
, domains = require(__dirname + '/../middleware/domains')
, corsHeaders = require('../middleware/cors')
, PGSessionStore = require('./pgsessionstore')
, tapinAuth = require('../middleware/tapin-auth')
, dump = require('../middleware/dump')

, magic = require('./magic')
, events = utils.requireDir('./../events', { relativeToProcess: false })
, search = require('./elastic-search')
;
require('js-yaml') // adds .yaml parsing to require()

function createAppServer() {
  var app = express();

  app.configure(function(){
    app.set('port', process.env.PORT || config.http.port);
    app.use(express.favicon());
    app.use(express.static(__dirname + '/../public'));
  });

  app.configure('development','test', function() {
    var domainAssert = require(__dirname + '/../middleware/domain-assert');
    app.use(domainAssert);
  });


  app.configure(function() {

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
    app.use(domains);

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

    // Allow Temporary authentication via tapins
    app.use(tapinAuth);

    // log all requests to the requests table.
    app.use(requestLogger());

    /**
     * Request & Response prototype updates
     */
    app.response.error = function(error, details) {
      utils.sendError(this, error, details);
    };
    app.response.noContent = function() {
      this.status(204).send('{}');
    };

    app.request.data = function(key, value) {
      this._dataBag = this._dataBag || {};
      if(typeof value != 'undefined') {
        this._dataBag[key] = value;
      }
      return this._dataBag[key];
    };

    app.use(app.router);

    var errorHandler = require(__dirname + '/../middleware/error-handler')(app);
    app.use(errorHandler);

  });

  // Development environment specific configuration settings for express
  app.configure('development', 'test', function(){
    app.get('/error', function() {
      process.nextTick(function() {
        throw new Error('Throwing error on purpose');
      });
    });

    app.get('/ping', function(req, res) {
      process.nextTick(function() {
        res.send(200, 'pong');
      });
    });

    //to test domain middleware is configured
    app.get('/request-id', function(req, res) {
      res.send(200, { uuid: req.uuid, domainId: process.domain.uuid });
    });
  });

  return app;
}

// Register Events
for (var group in events){
  for (var channel in events[group]){
    //console.log("register event: ", channel);
    magic.on(channel, events[group][channel]);
  }
}

exports.createAppServer = createAppServer;
