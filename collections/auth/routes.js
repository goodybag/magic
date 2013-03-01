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
    return res.error(errors.auth.INVALID_CODE), logger.routes.error(TAGS, errors.auth.INVALID_CODE);


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
      singly.get('/profiles', { access_token: accessToken }, function(error, result){
        if (error) return stage.singlyError(error);

        var user = {
          singlyId: result.body.id
        , singlyAccessToken: accessToken
        };
        // Get facebook data
        if (result.body.facebook) return stage.getFacebookData(accessToken, user);

        stage.createOrUpdateUser(user);
      });
    }

  , getFacebookData: function(accessToken, user){
      singly.get('/profiles/facebook', { access_token: accessToken }, function(error, result){
        if (error) return stage.singlyError(error);

        // Auto fill what we can
        user.firstName = result.body.data.first_name;
        user.lastName = result.body.data.last_name;
        stage.createOrUpdateUser(user);
      });
    }

  , createOrUpdateUser: function(user){
      db.getClient(TAGS[0], function(error, client){
        if (error) return stage.dbError(error);

        var query = sql.query('UPDATE users SET "singlyAccessToken" = $token WHERE "singlyId" = $id returning *');
        query.$('token', user.singlyAccessToken);
        query.$('id', user.singlyId);

        client.query(query.toString(), query.$values, function(error, result){
          if (error) return stage.dbError(error);

          if (result.rowCount === 0) return stage.createUser(user);
          return stage.lookupUsersGroups({
            id: result.rows[0].id
          , singlyId: user.singlyId
          , singlyAccessToken: user.singlyAccessToken
          });
        });
      });
    }

  , createUser: function(user){
      // Figure out which group creation thingy to send this to
      if (req.body.group === "consumer"){
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

      db.getClient(TAGS['oauth-authenticate-lookup-users-groups'], function(error, client){
        if (error) return stage.dbError(error);

        client.query(query.toString(), query.$values, function(error, results){
          if (error) return stage.dbError(error);

          var result = results.rows[0];
          user.groups = result ? result.groups : [];

          stage.setSessionAndSend(user);
        });
      });
    }

  , setSessionAndSend: function(user){
      req.session.user = user;
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
module.exports.authenticate = function(req, res){
  var TAGS = ['email-authentication', req.uuid];

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // First check for user existence
    var query = sql.query('SELECT id, email, password FROM users WHERE email = $email');
    query.$('email', req.body.email || '');

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (result.rows.length === 0)
        return res.error(errors.auth.INVALID_EMAIL), logger.routes.error(TAGS, error);

      var user = result.rows[0];

      // Compare passwords
      utils.comparePasswords(req.body.password, user.password, function(error, success){
        if (!success)
          return res.error(errors.auth.INVALID_PASSWORD), logger.routes.error(TAGS, error);

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

        client.query(query.toString(), query.$values, function(error, results){
          if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

          var result = results.rows[0];
          user.groups = result ? result.groups : [];

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