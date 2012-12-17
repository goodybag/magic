/*
  Authencation Middleware
*/

var
  // Module Dependencies
  utils     = require('../lib/utils')
, errors    = require('../lib/errors')
, logger    = require('../lib/logger')({ app: 'api', component: 'authentication-middleware' })

  /**
   * Just checks to see if the user is authenticated
   * @param  {Object}   req  Http Request Object
   * @param  {Object}   res  Http Result Object
   * @param  {Function} next The next function in the chain
   */
, auth = function(req, res, next){
    if (req.session && req.session.user) return next();
    utils.sendError(res, errors.auth.NOT_AUTHENTICATED);
  }

  /**
   * Checks to see if the user is allowed given a set of groups
   * @param  {Object}  user   The user in session
   * @param  {Array}   groups Array of groups that are allowed to see the resource
   * @return {Boolean}        Whether or not the user is allowed in
   */
, isUserAllowed = function(user, groups){
    var alloweds = 0;
    for (var i = groups.length - 1; i >= 0; i--)
      if (user.groups.indexOf(groups[i]) > -1) alloweds++;
    return user.groups.length === alloweds;
  }
;

/**
 * Middlware for only allowing specific groups to use endpoint
 * - May also pass in arguments individually
 * @param  {Array}    groups  List of groups allowed
 * @return {Function}         The middleware function
 */
auth.allow = function(groups){
  var groups = Array.isArray(groups) ? groups : Array.prototype.slice.call(arguments, 0);

  return function(req, res, next){
    var TAGS = [req.uuid];

    if (!req.session || !req.session.user)
      return logger.error(TAGS, errors.auth.NOT_AUTHENTICATED), res.json({ error: errors.auth.NOT_AUTHENTICATED, data: null });

    if (!req.session.user.groups || req.session.user.groups.length === 0 || !isUserAllowed(req.session.user, groups))
      return logger.error(TAGS, errors.auth.NOT_ALLOWED), res.json({ error: errors.auth.NOT_ALLOWED, data: null });
    next();
  };
};

module.exports = auth;