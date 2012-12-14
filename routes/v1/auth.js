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
 * Get user
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-users', req.uuid];
  logger.routes.debug(TAGS, 'fetching user ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = users.select.apply(
      users
    , req.fields
    ).from(
      users
    ).where(
      users.id.equals(req.params.id)
    ).toQuery();

    return res.send(query.text);

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows[0] });
    });
  });
};

/**
 * List users
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-users', req.uuid];
  logger.routes.debug(TAGS, 'fetching users ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = users.select.apply(
      users
    , req.fields
    ).from(
      users
    ).toQuery();

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows });
    });
  });
};

/**
 * Create users
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-users', req.uuid];
  logger.routes.debug(TAGS, 'creating user ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var user = {
      email:    req.body.email
    , password: req.body.password
    };

    utils.encryptPassword(user.password, function(error, password){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      user.password = passsword;

      var query = users.insert(user).toQuery();

      client.query(query.text, query.values, function(error, result){
        if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

        logger.db.debug(TAGS, result);

        return res.json({ error: null, data: result.rows[0] });
      });
    });
  });
};