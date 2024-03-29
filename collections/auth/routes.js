/**
 * Auth
 */

var
  db      = require('../../db')
, sql     = require('../../lib/sql')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config  = require('../../config')
, oauth   = require('../../lib/oauth')
, magic   = require('../../lib/magic')

, logger  = {}

//singly variables
, clientId      = config.singly.clientId
, clientSecret  = config.singly.clientSecret
, callbackUrl   = config.singly.callbackUrl
, apiBaseUrl    = config.singly.apiBaseUrl
, singly        = require('singly')(clientId, clientSecret,callbackUrl);
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

/**
 * Service Redirect, return redirect url
 * @param req
 * @param res
 */

/**
 * Get oauth authorization url
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.getOauthUrl = function(req, res){
  var TAGS = ['consumers-oauth', req.uuid];

  var validServices = [
    'facebook'
  ];

  if (!req.param('redirect_uri'))
    return res.error(errors.auth.INVALID_URI), logger.routes.error(TAGS, errors.auth.INVALID_URI);

  if (!req.param('service'))
    return res.error(errors.auth.SERVICE_REQUIRED), logger.routes.error(TAGS, errors.auth.SERVICE_REQUIRED);

  if (validServices.indexOf(req.param('service')) === -1)
    return res.error(errors.auth.INVALID_SERVICE), logger.routes.error(TAGS, errors.auth.INVALID_SERVICE);

  return res.json({
    error: null
  , data: {
      url: config.singly.apiBaseUrl
        + "/oauth/authorize?client_id="
        + config.singly.clientId
        + "&redirect_uri="
        + encodeURIComponent(req.param('redirect_uri'))
        + "&profile=all"
        + "&account=false"
        + "&service="
        + req.param('service')
    }
  });
};

module.exports.oauthAuthenticate = function(req, res){
  var TAGS = ['oauth-callback', req.uuid];

  var supportedGroups = [
    'consumer'
  ];

  if (!req.body.code && !req.body.singlyAccessToken)
    return res.error(errors.auth.INVALID_CODE), logger.routes.error(TAGS, errors.auth.INVALID_CODE);


  if (supportedGroups.indexOf(req.body.group) === -1)
    return res.error(errors.auth.INVALID_GROUP), logger.routes.error(TAGS, errors.auth.INVALID_GROUP);

  var stage = {
    start: function(){
      function done(error, user) {
        if (error) return stage.singlyError(error); // what about db errors?
        if (user == null) return; //TODO: proper error handling
        if (user.userId == null)
          stage.createOrUpdateUser(user);
        else
          stage.updatePendingUser(user);
      };

      if (req.body.code)
        return oauth.authWithCode(req.body.code, done);

      if (req.body.singlyAccessToken && req.body.singlyId)
        return oauth.authWithTokenAndId(req.body.singlyAccessToken, req.body.singlyId, done);

      if (req.body.singlyAccessToken)
        return oauth.authWithToken(req.body.singlyAccessToken, done);

      return res.error(errors.auth.INVALID_CODE), logger.routes.error(TAGS, errors.auth.INVALID_CODE);
    }

  , updatePendingUser: function(user){
      var
        $update = { singlyId: user.singlyId, singlyAccessToken: user.singlyAccessToken }
      , options = { returning: ['cardId', 'email'] }
      ;

      db.api.users.update(user.id, $update, options, function(error, results){
        if (error) return stage.dbError(error);

        // Herrmm that's weird
        if (results.length === 0) return createOrUpdateUser(user);

        user.cardId = results[0].cardId;
        user.email = results[0].email;

        return stage.lookupUsersGroups(user);
      });
    }

  , createOrUpdateUser: function(user){

      var query = sql.query('UPDATE users SET "singlyAccessToken" = $token WHERE "singlyId" = $id returning *');
      query.$('token', user.singlyAccessToken);
      query.$('id', user.singlyId);

      db.query(query, function(error, rows, result){
        if (error) return stage.dbError(error);

        if (result.rowCount === 0) return stage.createUser(user);
        return stage.lookupUsersGroups({
          id: result.rows[0].id
        , singlyId: user.singlyId
        , singlyAccessToken: user.singlyAccessToken
        });
      });
    }

  , createUser: function(user){
      // Figure out which group creation thingy to send this to
      if (req.body.group === "consumer"){
        db.procedures.setLogTags(TAGS);
        db.procedures.registerUser('consumer', user, function(error, consumer){
          if (error) return stage.error(error);

          stage.setSessionAndSend(consumer);

          magic.emit('consumers.registered', consumer);
        });
      }else{
        res.error(errors.auth.INVALID_GROUP);
        return logger.routes.error(TAGS, errors.auth.INVALID_GROUP);
      }
    }

    // This is a sham, but whatevs
  , lookupUsersGroups: function(user){
      var query = sql.query([
          'SELECT'
        , '  array_agg(groups.name)  as groups'
        , 'FROM "usersGroups"'
        , '  LEFT JOIN groups'
        , '    ON "usersGroups"."groupId" = groups.id'
        , 'WHERE "usersGroups"."userId"  = $id'
        ]);

      query.$('id', user.id);


      db.query(query, function(error, rows, results){
        if (error) return stage.dbError(error);

        var result = rows[0];
        user.groups = result ? result.groups : [];

        stage.setSessionAndSend(user);
      });
    }

  , setSessionAndSend: function(user){
      req.session.user = user;

      // use session cookie if remember is set to false
      var remember = req.body.remember;
      if (remember != null && !remember) {
        req.session.cookie._expires = null;
        req.session.cookie.originalMaxAge = null;
      }


      res.json({ error: null, data: user });
    }

  , error: function(error){
      res.error(error);
      logger.routes.error(TAGS, error);
    }

  , singlyError: function(error){
      res.error(error);
      logger.routes.error(TAGS, error);
    }

  , dbError: function(error){
      res.error(errors.internal.DB_FAILURE, error);
      logger.routes.error(TAGS, error);
    }
  };

  stage.start();
};

/**
 * Email Authentication
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.authenticate = function(req, res, next){
  var TAGS = ['email-authentication', req.uuid];

  // First check for user existence
  var query = sql.query('SELECT id, email, password FROM users WHERE email = $email');
  query.$('email', req.body.email || '');

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    if (result.rows.length === 0)
      return res.error(errors.auth.INVALID_EMAIL), logger.routes.error(TAGS, 'invalid email');

    var user = result.rows[0];

    // Compare passwords
    utils.comparePasswords(req.body.password, user.password, function(error, success){
      if(error) {
        //handle the error as an unhandled route error
        //bcrypt should not raise an error in regular circumstances
        return next(error);
      }
      if (!success) {
        return res.error(errors.auth.INVALID_PASSWORD), logger.routes.error(TAGS, 'invalid password');
      }

      // Remove password
      delete user.password;

      // Setup groups
      query = sql.query([
        'SELECT'
      , '  array_agg(groups.name)  as groups'
      , 'FROM "usersGroups"'
      , '  LEFT JOIN groups'
      , '    ON "usersGroups"."groupId" = groups.id'
      , 'WHERE "usersGroups"."userId"  = $id'
      ]);

      query.$('id', user.id);

      db.query(query, function(error, rows, results){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        var result = results.rows[0];
        user.groups = result ? result.groups : [];

        // Save user in session
        req.session.user = user;

          // use session cookie if remember is set to false
          var remember = req.body.remember;
          if (remember != null && !remember) {
            req.session.cookie._expires = null;
            req.session.cookie.originalMaxAge = null;
          }

          // TODO: get user info based on groups
          return res.json({ error: null, data: user });
        }); // End setup groups query
      }); // End compare passwords
    }); // End User existence query
};

/**
 * Destroys the current session
 * @param  {Object} req HTTP request object
 * @param  {Object} res HTTP result object
 */
module.exports.logout = function(req, res){
  req.session.user = null;
  res.json({ error: null, data: null });
};

/**
 * Gets current user object in session
 * @param  {Object} req HTTP request object
 * @param  {Object} res HTTP result object
 */
module.exports.session = function(req, res){
  res.json({ error: null, data: req.session ? req.session.user : null });
};
