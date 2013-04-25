
/**
 * Module dependencies
 */

var
  _ = require('underscore')
, extend = require('node.extend')
, winston = require('winston')
, config = require('../config')
, FileRotate = require('./file-rotate')
, Papertrail = require('winston-papertrail').Papertrail
, Loggly = require('winston-loggly').Loggly
;

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

  logger.log = function(level, msg, meta, callback){
    msg = (_.isObject(msg)) ? extend(options.msg, msg) : msg;
    winston.Logger.prototype.log.call(this, level, msg, meta, callback);
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
      //simple path - single log string
      var base = baseMeta();
      if(arguments.length === 1) {
        return winston.Logger.prototype.log.call(logger, level, tags, base);
      }
      meta = extend(base, meta);
      tags = _.isString(tags) ? [tags] : tags;
      meta.tags = tags;
      this.log(level, msg, meta, callback);
    }
  };
  ['debug', 'info', 'warn', 'error'].forEach(addLevel);

  return logger;
};

var NoOpLogger = function() {
  
};

NoOpLogger.prototype.debug = NoOpLogger.prototype.info = NoOpLogger.prototype.warn = NoOpLogger.prototype.error = function() {};
