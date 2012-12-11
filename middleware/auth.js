/*
  Authencation Middleware
*/

var
  // Module Dependencies
  utils     = require('../utils')
, errors    = require('../errors')
, logger    = require('../logger')

  // Module Variables
, auth = function(req, res, next){
    if (req.session && req.session.user) return next();
    logger.info(req.session);
    logger.info(errors.authentication);
    utils.sendError(res, errors.authentication);
  }
;
module.exports = auth;