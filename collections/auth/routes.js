/**
 * Auth
 */

var
  db      = require('../../db')
, sql     = require('../../lib/sql')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config = require('../../config')

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

  logger.routes.debug(TAGS, 'validing redirect_uri');
  if (!req.param('redirect_uri'))
    return res.error(errors.auth.INVALID_URI), logger.routes.error(TAGS, errors.auth.INVALID_URI);

  logger.routes.debug(TAGS, 'determining if service is valid');
  if (!req.param('service'))
    return res.error(errors.auth.SERVICE_REQUIRED), logger.routes.error(TAGS, errors.auth.SERVICE_REQUIRED);

  if (validServices.indexOf(req.param('service')) === -1)
    return res.error(errors.auth.INVALID_SERVICE), logger.routes.error(TAGS, errors.auth.INVALID_SERVICE);

  logger.routes.debug(TAGS, 'Sending back redirect url');

  return res.json({
    error: null
  , data: {
      url: config.singly.apiBaseUrl
        + "/oauth/authenticate?client_id="
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

  if (!req.body.code && !(req.body.singlyAccessToken && req.body.singlyId))
    

  if (supportedGroups.indexOf(req.body.group) === -1)
    return res.error(errors.auth.INVALID_GROUP), logger.routes.error(TAGS, errors.auth.INVALID_GROUP);


  // Get the user accessToken/Id
  // If the user exists
    // Update their accessToken
    // Update session
    // Send session
  // If the user doesn't exist
    // Figure out what group they're authenticating to
    // (?group=consumer)
    // POST to that kind of account creation
    // Update session with returned user
    // Send session

  var stage = {
    start: function(){
      if (req.body.code)
        return stage.getAccessTokenAndId(req.body.code);

      if (req.body.singlyAccessToken && req.body.singlyId)
        return stage.createOrUpdateUser({
          singlyId: req.body.singlyId
        , singlyAccessToken: req.body.singlyAccessToken
        });

      if (req.body.singlyAccessToken)
        return stage.getSinglyId(req.body.singlyAccessToken);

      return res.error(errors.auth.INVALID_CODE), logger.routes.error(TAGS, errors.auth.INVALID_CODE);
    }

  , getAccessTokenAndId: function(code){
      singly.getAccessToken(code, function(error, response, token){
        if (error) return stage.singlyError(error);

        stage.getSinglyId(token.access_token);
      });
    }

  , getSinglyId: function(accessToken){
      var data = { access_token: accessToken };
      singly.get('/profiles', data, function(error, result){
        if (error) return stage.singlyError(error);

        var user = {
          singlyId: result.body.id
        , singlyAccessToken: token.access_token
        };

        // Get facebook data
        if (result.body.facebook) return stage.getFacebookData(accessToken, user);

        stage.createOrUpdateUser(user);
      });
    }

  , getFacebookData: function(accessToken, user){
      singly.get('/profiles/facebook', data, function(error, result){
        if (error) return stage.singlyError(error);

        // Auto fill what we can
        user.firstName = result.body.data.first_name;
        user.lastName = result.body.data.last_name;

        stage.createOrUpdateUser(user);
      });
    }

  , createOrUpdateUser: function(user){
      db.getClient(function(error, client){
        if (error) return stage.dbError(error);

        var query = sql.query('UPDATE users SET "singlyAccessToken" = $token WHERE "singlyId" = $id');
        query.$('token', user.singlyAccessToken);
        query.$('id', user.singlyId);

        client.query(query.toString(), query.$values, function(error, result){
          if (error) return stage.dbError(error);

          if (result.rowCount === 0) return stage.createUser(user);
          return stage.setSessionAndSend({
            id: result.rows[0].id
          , singlyId: user.singlyId
          , singlyAccessToken: user.singlyAccessToken
          });
        });
      });
    }

  , createUser: function(user){
      var url = config.baseUrl;
      if (url.indexOf(':') === -1) url += ":" + config.http.port;

      // Figure out which group creation thingy to send this to
      if (req.body.group === "consumer"){
        utils.post(url + '/v1/consumers', user, function(error, response, result){
          // Really shouldn't happen
          // TODO: send an actual error
          if (error) return stage.singlyError(error);

          // No need to log - already logged from the post
          if (result.error) return res.error(result.error);

          return stage.setSessionAndSend(result.data);
        });
      }else{
        res.error(errors.auth.INVALID_GROUP);
        return logger.routes.error(TAGS, errors.auth.INVALID_GROUP);
      }

    }

  , setSessionAndSend: function(user){
      req.session.user = user;
      res.json({ error: null, data: user });
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
module.exports.authenticate = function(req, res){
  var TAGS = ['email-authentication', req.uuid];
  logger.routes.debug(TAGS, 'attempting to authenticate', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // First check for user existence
    var query = sql.query('SELECT id, email, password FROM users WHERE email = $email');
    query.$('email', req.body.email || '');

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      if (result.rows.length === 0)
        return res.error(errors.auth.INVALID_EMAIL), logger.routes.error(TAGS, error);

      var user = result.rows[0];

      logger.db.debug(TAGS, "Comparing passwords");

      // Compare passwords
      utils.comparePasswords(req.body.password, user.password, function(error, success){
        if (!success)
          return res.error(errors.auth.INVALID_PASSWORD), logger.routes.error(TAGS, error);

        // Remove password
        delete user.password;

        logger.db.debug(TAGS, "Getting groups and setting on user");

        // Setup groups
        query = sql.query([
          'SELECT array_agg(groups.name) as groups FROM "usersGroups"',
            'INNER JOIN "groups" ON "usersGroups"."groupId" = groups.id',
            'WHERE "usersGroups"."userId" = $id',
            'GROUP BY "usersGroups"."userId"'
        ]);
        query.$('id', user.id);

        client.query(query.toString(), query.$values, function(error, results){
          if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

          user.groups = results.rows[0] ? results.rows[0].groups : [];

          // Save user in session
          req.session.user = user;

          // TODO: get user info based on groups

          return res.json({ error: null, data: user });
        }); // End setup groups query
      }); // End compare passwords
    }); // End User existence query
  }); // End getClient
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