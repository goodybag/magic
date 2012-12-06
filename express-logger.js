
/**
 * Module dependencies
 */

require('noop');

var
  util = require('util')
, extend = require('node.extend')
, winston = require('winston')
, async = require('async')
;

module.exports = function(options){
  var defaults = {
    level: 'info'
  , transports: [new winston.transports.Console({})]
  , msg: {}
  , meta: {}
  };

  options = extend(defaults, options);

  return function(req, res, next){
    var msg = {
    req:{
        headers: req.headers
      , method: req.method
      , url: req.url
      , query: req.query
      , params: req.params
      , body: req.body
      , uuid: req.uuid
      }
    , res: {
        statusCode: res.statusCode
      }
    };

    var meta = {};

    msg = extend(msg, options.msg);
    meta = extend(meta, options.meta);

    var log = function(transport, cb){
      transport.log(options.level, msg, meta, noop);
      cb();
    };

    async.forEach(options.transports, log, noop);

    next();
  }
};