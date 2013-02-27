/**
 * Managers
 */

var
  singly  = require('singly')

  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config  = require('../../config')

, logger  = {}
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

/**
 * Get manager
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-managers', req.uuid];
  logger.routes.debug(TAGS, 'fetching manager ' + req.params.id);

  db.getClient(TAGS[0], function(error, client) {
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'SELECT {fields} FROM users',
        'LEFT JOIN "managers" ON "managers"."userId" = users.id',
        'WHERE users.id = $id'
    ]);
    query.fields = sql.fields().add('managers.*');
    query.$('id', +req.param('id') || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (result.rowCount == 1) {
        return res.json({ error: null, data: result.rows[0] });
      } else {
        return res.status(404).end();
      }
    });
  });
};

/**
 * List managers
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-users', req.uuid];
  logger.routes.debug(TAGS, 'fetching users ' + req.params.id);

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = sql.query([
      'SELECT {fields} FROM managers',
        'INNER JOIN users ON managers."userId" = users.id',
        '{where} {limit}'
    ]);
    query.fields = sql.fields().add('managers.*');
    query.where  = sql.where();
    query.limit  = sql.limit(req.query.limit, req.query.offset);

    if (req.param('filter')) {
      query.where.and('users.email ILIKE $emailFilter');
      query.$('emailFilter', '%'+req.param('filter')+'%');
    }

    query.fields.add('COUNT(*) OVER() as "metaTotal"');

    // run data query
    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
      return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
    });
  });
};

/**
 * Create managers
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-managers', req.uuid];
  logger.routes.debug(TAGS, 'creating manager ' + req.params.id);

  utils.encryptPassword(req.body.password, function(err, encryptedPassword, passwordSalt) {

    db.getClient(TAGS[0], function(error, client){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var query = sql.query([
        'WITH',
          '"user" AS',
            '(INSERT INTO users (email, password, "passwordSalt", "singlyId", "singlyAccessToken", "cardId")',
              'SELECT $email, $password, $salt, $singlyId, $singlyAccessToken, $cardId',
                'WHERE NOT EXISTS (SELECT 1 FROM users WHERE {uidField} = $uid)',
                'RETURNING id),',
          '"userGroup" AS',
            '(INSERT INTO "usersGroups" ("userId", "groupId")',
              'SELECT "user".id, groups.id FROM groups, "user" WHERE groups.name = \'manager\' RETURNING id),',
          '"manager" AS',
            '(INSERT INTO "managers" ("userId", "businessId", "locationId")',
              'SELECT "user".id, $businessId, $locationId FROM "user")',
        'SELECT "user".id as "userId" FROM "user"'
      ]);
      if (req.body.email) {
        query.uidField = 'email';
        query.$('uid', req.body.email);
      } else {
        query.uidField = '"singlyId"';
        query.$('uid', req.body.singlyId);
      }
      query.$('email', req.body.email);
      query.$('password', encryptedPassword);
      query.$('salt', passwordSalt);
      query.$('singlyId', req.body.singlyId);
      query.$('singlyAccessToken', req.body.singlyAccessToken);
      query.$('cardId', req.body.cardId || '');
      query.$('businessId', req.body.businessId);
      query.$('locationId', req.body.locationId);

      client.query(query.toString(), query.$values, function(error, result) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        // did the insert occur?
        if (result.rowCount === 0) {
          // email must have already existed
          if (req.body.email) return res.error(errors.registration.EMAIL_REGISTERED);

          // Access token already existed - for now, send back generic error
          // Because they should have used POST /oauth to create/auth
          return res.error(errors.internal.DB_FAILURE);
        }

        return res.json({ error: null, data: result.rows[0] });
      });
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
  logger.routes.debug(TAGS, 'deleting user ' + req.params.id);

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('DELETE FROM users WHERE users.id = $id');
    query.$('id', +req.params.id || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) return res.status(404).end();

      res.noContent();
    });
  });
};

/**
 * Update manager
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-manager', req.uuid];
  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('UPDATE managers SET {updates} WHERE "userId"=$id');
    query.updates = sql.fields().addUpdateMap(req.body, query);
    query.$('id', req.params.id);

    // run update query
    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      // did the update occur?
      if (result.rowCount === 0) {
        return res.status(404).end();
      }

      // done
      res.noContent();
    });
  });
};
