/**
 * Users
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

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

    var query = utils.selectAsMap(users, req.fields)
      .from(users)
      .where(users.id.equals(req.params.id))
      .toQuery();

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);
      return res.json({ error: null, data: result.rows[0] || null});
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

    var query = utils.selectAsMap(users, req.fields)
      .from(users)
      .toQuery();

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

    var userEmail = users.select(users.id).from(users).where(users.email.equals(req.body.email)).toQuery();

    client.query(userEmail.text, userEmail.values, function(error,result){

      if(error) return res.json({error:error, data: result}), logger.routes.error(TAGS, error);

    if(result.rows.length == 0){

    utils.encryptPassword(user.password, function(error, password){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      user.password = password;

      var query = users.insert(user).toQuery();

      client.query(query.text + "RETURNING id", query.values, function(error, result){
        if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

        logger.db.debug(TAGS, result);

        return res.json({ error: null, data: result.rows[0] });
      });
    });
    }
    else
      {
        return res.json({error: errors.registration.EMAIL_REGISTERED});
      }
    });
  });
};

/**
 * Delete user
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-user', req.uuid];
  logger.routes.debug(TAGS, 'deleting user ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = users.delete().where(
      users.id.equals(req.params.id)
    ).toQuery();

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};

/**
 * Update user - there's no data modification here, so no need to validate
 * since we've already validated in the middleware
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-user', req.uuid];
  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    // Don't let them update the id
    delete req.body.id;

    // Only let them update certain fields
    // :TODO: remove? -- should have been replaced in middleware
    /*
    var data;
    if (req.fields){
      var fieldsAvailable = 0;
      data = {};
      for (var key in req.body){
        if (req.fieldFieldNames.indexOf(key) > -1){
          data[key] = req.body[key];
          fieldsAvailable++;
        }
      }

      // Trying to update things they're not allowed to
      if (fieldsAvailable === 0)
        return res.json({ error: errors.auth.NOT_ALLOWED, data: null }), logger.routes.error(TAGS, errors.auth.NOT_ALLOWED);
    }
    */

    var query = users.update(data || req.body).where(
      users.id.equals(req.params.id)
    ).toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};
