/*
  Authencation Middleware
*/

var
  // Module Dependencies
  utils     = require('../lib/utils')
, errors    = require('../lib/errors')
, logger    = require('../lib/logger')({ app: 'api', component: 'authentication-middleware' })

  // Module Variables
, auth = function(req, res, next){
    if (req.session && req.session.user) return next();
    utils.sendError(res, errors.auth.NOT_AUTHENTICATED);
  }
;

auth.allow = function(){
  var groups = Array.prototype.slice.call(arguments, 0);

  return function(req, res, next){
    if (!req.session || req.session.user) return utils.sendError(res, errors.auth.NOT_AUTHENTICATED);

    if (req.session.user.groups.length === 0) return utils.sendError(res, errors.auth.NOT_ALLOWED);


  };
};

module.exports = auth;