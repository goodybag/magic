/**
 * Auth
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config = require('../../config')

, logger  = {}

  // Tables
, users       = db.tables.users
, groups      = db.tables.groups
, userGroups  = db.tables.userGroups

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

module.exports.singlyRedirect = function (req, res){
  //get service
  var service = req.param('service');
  var url = apiBaseUrl+'/oauth/authorize?client_id='+clientId+'&service='+service+'&redirect_uri='+callbackUrl;
  return res.json({error: null, data: url});
};

module.exports.singlyCallback =  function(req, res){

  var TAGS = ['create-singly-user', req.uuid];

  db.getClient( function(error, client){
    // if callback doesn't return code then return SINGLY CALLBACK error
    if(req.toString().indexOf('code') === -1){
      logger.routes.error(TAGS, errors.auth.SINGLY_CALLBACK);
      return res.json({error: errors.auth.SINGLY_CALLBACK });
    } else{
    var code = req.param('code');

    //get access token from callback
    singly.getAccessToken(code, function(err, accessTokenRes, token){

      // get singly Id form profile
      singly.get('/profiles', {access_token: token.access_token},

        function(err, profiles){

          // check for singlyId existence
          var singlyIdQuery = users.select(users.id).from(users).where(users.singlyId.equals(profiles.body.id)).toQuery();

          client.query(singlyIdQuery.text, singlyIdQuery.values, function(error,result){

            if(error) return res.json({error:error, data: result}), logger.routes.error(TAGS, error);

            // if singlyId is in the users table then update singlyAccessToken column, else create new user
            if(result.rows.length === 0){

              var insertQuery = users.insert({
                'singlyAccessToken': token.access_token
                , 'singlyId': profiles.body.id
              }).toQuery();

              logger.db.debug(TAGS, insertQuery.text);

              client.query(insertQuery.text + 'RETURNING id', insertQuery.values, function(error, result){
                if (error) return res.json({error: error, data: null}), logger.routes.error(TAGS, error);

                logger.db.debug(TAGS, result);

                return res.json({error: null, data:result.rows[0]});

              });

            } else {
              var updateQuery = users.update({
                'singlyAccessToken': token.access_token
              }).where(users.singlyId.equals(profiles.body.id)).toQuery();

              logger.db.debug(TAGS, updateQuery.text);

              client.query(updateQuery.text, updateQuery.values, function(error,result){
                if(error) return res.json({error:error, data: result}), logger.routes.error(TAGS, error);

                return res.json({error: null, data:result.rows[0]});
              });
            }
          }); //singlyIdQuery
        }); // end of singly.get
      }); // end of singly.getAccessToken
    } // end of test callback url condition
  });

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
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    // First check for user existence
    var query = users.select(
      users.id, users.email, users.password
    ).from(users).where(
      users.email.equals(req.body.email)
    ).toQuery();


    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      if (result.rows.length === 0)
        return res.json({ error: errors.auth.INVALID_EMAIL, data: null }), logger.routes.error(TAGS, error);

      var user = result.rows[0];

      logger.db.debug(TAGS, "Comparing passwords");

      // Compare passwords
      utils.comparePasswords(req.body.password, user.password, function(error, success){
        if (error)
          return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

        if (!success)
          return res.json({ error: errors.auth.INVALID_PASSWORD, data: null }), logger.routes.error(TAGS, error);

        // Remove password
        delete user.password;

        logger.db.debug(TAGS, "Getting groups and setting on user");

        // Setup groups
        query = userGroups.select(
          groups.name
        ).from(
          userGroups.join(groups).on(
            userGroups.groupId.equals(groups.id)
          )
        ).where(
          userGroups.userId.equals(user.id)
        ).toQuery();

        client.query(query.text, query.values, function(error, results){
          if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

          user.groups = results.rows.map(function(group){ return group.name; });

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