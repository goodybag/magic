/**
 * Users
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, schemas = require('../../schemas/routes')

, logger  = {}

  // Tables
, users       = db.tables.users
, groups      = db.tables.groups
, userGroups  = db.tables.userGroups
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


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

        // Setup groups
        query = userGroups.select(
          groups.name
        );

        return res.send(query.text);

        return res.json({ error: null, data: result.rows[0] });
      });

    });
  });
};
