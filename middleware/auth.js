/*
  Authencation Middleware
*/

var
  // Module Dependencies
  utils     = require('../lib/utils')
, errors    = require('../lib/errors')
, logger    = require('../lib/logger')

  // Module Variables
, auth = function(req, res, next){
    if (req.session && req.session.user) return next();
    logger.info(req.session);
    logger.info(errors.authentication);
    utils.sendError(res, errors.authentication);
  }
;
module.exports = auth;