
/**
 * Module dependencies
 */

var
  _ = require('underscore')
, extend = require('node.extend')
, winston = require('winston')
, config = require('../config')
, FileRotate = require('./file-rotate')
, loggly = require('loggly')
, Papertrail = require('winston-papertrail').Papertrail;
;

var logglyClient = loggly.createClient(config.loggly);

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

    if (config.logging.transports.papertrail) {
      defaults.transports.push(new Papertrail(config.papertrail));
    }
  }

  if (options === null) throw new Error('options required');
  if (options.app === null) throw new Error('app is required');

  options = extend(defaults, options);

  if (_.isString(options.app)) options.meta.app = options.app;
  if (_.isString(options.component)) options.meta.component = options.component;

  var logger = new (winston.Logger)(options);

  logger.log = function(level, msg, meta, callback){
    msg = (_.isObject(msg)) ? extend(options.msg, msg) : msg;
    meta = (_.isObject(meta)) ? extend(options.meta, meta) : meta;
    winston.Logger.prototype.log.call(this, level, msg, meta, callback);
    logglyClient.log('073b990f-2045-4f46-9290-84e9fc79ff61', msg); // :TODO: use a winston transport
  };

  logger.debug = function(tags, msg, meta, callback){
    meta = extend({}, meta);
    tags = _.isString(tags) ? [tags] : tags;
    meta.tags = tags;
    this.log('debug', msg, meta, callback);
  };

  logger.info = function(tags, msg, meta, callback){
    meta = extend({}, meta);
    tags = _.isString(tags) ? [tags] : tags;
    meta.tags = tags;
    this.log('info', msg, meta, callback);
  };

  logger.warn = function(tags, msg, meta, callback){
    meta = extend({}, meta);
    tags = _.isString(tags) ? [tags] : tags;
    meta.tags = tags;
    this.log('warn', msg, meta, callback);
  };

  logger.error = function(tags, msg, meta, callback){
    meta = extend({}, meta);
    tags = _.isString(tags) ? [tags] : tags;
    meta.tags = tags;
    this.log('error', msg, meta, callback);
  };

  return logger;
};
