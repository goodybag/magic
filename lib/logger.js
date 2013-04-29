
/**
 * Module dependencies
 */

var
  _ = require('underscore')
, extend = require('node.extend')
, winston = require('winston')
, config = require('../config')
, FileRotate = require('./file-rotate')
, Loggly = require('winston-loggly').Loggly
, Gelf = require('gelf')
, microtime = require('microtime')
;

//create file-wide gelf instance
var gelf = new Gelf({
  graylogPort: 12201,
  graylogHostname: '192.168.13.105',
  connection: 'wan',
  maxChunkSizeWan: 1420,
  maxChunkSizeLan: 8154
});

/**
 * Create a new logger
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
module.exports = function(options){
  var defaults = {
    transports: []
  , meta: {}
  };

  //return a no-op logger if logging is disabled
  if(!config.logging.enabled) {
    return new NoOpLogger();
  }

  if (config.logging.enabled && config.logging.transports) {
    if (config.logging.transports.console) {
      defaults.transports.push(
        new (winston.transports.Console)({json: true})
      );
    }

    if (config.logging.transports.fileRotate) {
      defaults.transports.push(
        new FileRotate({
          filename: 'all.log'
        , dirname: 'logs'
        , json: true
        })
      );
    }

    if (config.logging.transports.loggly) {
      defaults.transports.push(new Loggly(config.loggly));
    }

    if(config.logging.transports.devConsole) {
      var DevConsoleTransport = require(__dirname + '/dev-console-transport');
      defaults.transports.push(new DevConsoleTransport());
    }
  }

  if(typeof options == 'string') options = { app: 'api', component: options };
  if (options === null) throw new Error('options required');
  if (options.app === null) throw new Error('app is required');

  options = extend(defaults, options);

  if (_.isString(options.app)) options.meta.app = options.app;
  if (_.isString(options.component)) options.meta.component = options.component;

  var logger = new (winston.Logger)(options);

  //export the gelf module for testability
  logger.gelf = gelf;
  logger.meta = options.meta;

  //http://www.ypass.net/blog/2012/06/introduction-to-syslog-log-levelspriorities/
  var gelfLevel = {
    debug: 7,
    info: 6,
    notice: 5, //not used
    warn: 4,
    error: 3,
    critical: 2, //not used
    alert: 1, //not used
    emergency: 0, //not use
  };

  var buildGelf = function(level, msg, meta) {
    var packet = {
      version: '1.0',
      host: 'magic',
      short_message: msg,
      timestamp: microtime.nowDouble(),
      level: gelfLevel[level],
      facility: meta.component
    };

    if(meta.error) {
    }
    for(var key in meta) {
      if(key == 'error') {
        packet.full_message = meta.error.stack;
      } else {
        packet['_' + key] = meta[key];
      }
    }
    return packet;
  };

  logger.log = function(level, msg, meta, callback){
    msg = (_.isObject(msg)) ? extend(options.msg, msg) : msg;
    winston.Logger.prototype.log.call(this, level, msg, meta, callback);
    var packet = buildGelf(level, msg, meta);
    gelf.emit('gelf.log', packet);
  };

  //returns base set of meta
  var baseMeta = function(more) {
    var meta = extend({}, options.meta);
    if(process.domain) {
      meta.domain = process.domain.name;
      var req = process.domain.members[0];
      //if we're on an http request
      if((req||0).url) {
        meta.uuid = req.uuid;
        meta.url = req.url;
        meta.method = req.method;
      }
    }
    return meta;
  };

  var addLevel = function(level) {
    logger[level] = function(tags, msg, meta, callback) {
      var base = baseMeta();
      if(arguments.length < 3) {
        //try to figure out arguments

        //log.info('message'); - single message
        if(arguments.length === 1) {
          msg = tags;
          tags = [];
          meta = {};
        } 
        else if(arguments.length === 2) {
          //log.info('message', {some: 'meta'})
          if(typeof tags == 'string' && typeof msg == 'object') {
            meta = msg;
            msg = tags;
            tags = [];
          } 
        }
      }
      meta = extend(base, meta);
      tags = _.isString(tags) ? [tags] : tags;
      meta.tags = tags;
      logger.log(level, msg, meta, callback);
    }
  };
  ['debug', 'info', 'warn', 'error'].forEach(addLevel);
  var logError = logger.error;
  logger.error = function(tags, message, meta) {
    if(tags instanceof Error) {
      return logError('error', tags.message || 'error', { error: tags });
    }
    if(message instanceof Error) {
      return logError(tags, message.message || 'error', { error: message });
    }
    if(meta instanceof Error) {
      return logError(tags, message, {error: meta});
    }
    logError(tags, message, meta);
  };

  return logger;
};

var NoOpLogger = function() {
  
};

NoOpLogger.prototype.debug = NoOpLogger.prototype.info = NoOpLogger.prototype.warn = NoOpLogger.prototype.error = function() {};
