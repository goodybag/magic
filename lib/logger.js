
/**
 * Module dependencies
 */

var
  _ = require('underscore')
, extend = require('node.extend')
, winston = require('winston')
, FileRotate = require('./file-rotate')
;

/**
 * Create a new logger
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
module.exports = function(options){
  var defaults = {
    transports: [
      new FileRotate({ // default transport
        filename: 'all.log'
      , dirname: 'logs'
      , json: true
      })
    ]
  , meta: {}
  };

  if (options == null) throw new Error('options required');
  if(options.app == null) throw new Error('app is required');

  options = extend(defaults, options);

  if(_.isString(options.app)) options.meta.app = options.app;
  if(_.isString(options.component)) options.meta.component = options.component;

  var logger = new (winston.Logger)(options);

  logger.log = function(level, msg, meta, callback){
    msg = (_.isObject(msg)) ? extend(options.msg, msg) : msg;
    meta = (_.isObject(meta)) ? extend(options.meta, meta) : meta;
    winston.Logger.prototype.log.call(this, level, msg, meta, callback);
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