/**
 * Consumers
 */

var
  singly  = require('singly')

  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config  = require('../../config')

, logger  = {}

  // Tables
, users       = db.tables.users
, consumers   = db.tables.consumers
, groups      = db.tables.groups
, usersGroups = db.tables.usersGroups
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

/**
 * Get consumer
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-consumers', req.uuid];
  logger.routes.debug(TAGS, 'fetching consumer ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var fields = [];
    for (var field in req.fields){
      fields.push(
        (("id,email,password,singlyId,singlyAccessToken".indexOf(field) > -1)
          ? '"users"'
          : '"consumers"')
      + '."'
      + req.fields[field].name + '" AS "'
      + field + '"'
      );
    }
    var query = [
      'SELECT', fields.join(', '), 'FROM consumers',
        'LEFT JOIN users ON consumers."userId" = users.id',
        'WHERE consumers.id = $1'
    ].join(' ');

    client.query(query, [(+req.param('id')) || 0], function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      if (result.rowCount == 1) {
        return res.json({ error: null, data: result.rows[0] });
      } else {
        return res.status(404).end();
      }
    });
  });
};

/**
 * List consumers
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-consumers', req.uuid];
  logger.routes.debug(TAGS, 'fetching consumers ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = utils.selectAsMap(users, req.fields).from(
      users.join(consumers).on(
        users.id.equals(consumers.userId)
      )
    );

    // add query filters
    if (req.param('filter')) {
      query.where(users.email.like('%'+req.param('filter')+'%'))
    }
    utils.paginateQuery(req, query);

    // run data query
    client.query(query.toQuery(), function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, dataResult);

      // run count query
      client.query('SELECT COUNT(*) as count FROM users INNER JOIN consumers ON users.id = consumers."userId"', function(error, countResult) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: dataResult.rows, meta: { total:countResult.rows[0].count } });
      });
    });
  });
};

/**
 * Create consumers
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-consumers', req.uuid];
  logger.routes.debug(TAGS, 'creating consumer ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build user query
    var userFields, userValues;
    if (req.body.email) {
      userFields = ['email', 'password'];
      userValues = [req.body.email, utils.encryptPassword(req.body.password)];
    } else {
      userFields = ['singlyId', 'singlyAccessToken'];
      userValues = [req.body.singlyId, req.body.singlyAccessToken];
    }
    userValues = userValues.concat([
      req.body.firstName, req.body.lastName, req.body.cardId, req.body.screenName
    ]);
    var userFieldsStr = userFields.map(function(f) { return '"'+f+'"'; }).join(', ');      

    var query = [
      'WITH',
        '"user" AS',
          '(INSERT INTO users (', userFieldsStr, ') SELECT $1, $2 FROM users',
            'WHERE NOT EXISTS (SELECT 1 FROM users WHERE', '"'+userFields[0]+'"', '= $1)',
            'RETURNING id),',
        '"userGroup" AS',
          '(INSERT INTO "usersGroups" ("userId", "groupId")',
            'SELECT "user".id, groups.id FROM groups, "user" WHERE groups.name = \'consumer\' RETURNING id),',
        '"consumer" AS',
          '(INSERT INTO consumers ("userId", "firstName", "lastName", "cardId", "screenName")',
            'SELECT "user".id, $3, $4, $5, $6 FROM "user" RETURNING id)', // $1=cardId
      'SELECT "user".id as "userId", "consumer".id as "consumerId" FROM "user", "consumer"'
    ].join(' ');
    client.query(query, userValues, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      // did the insert occur?
      if (result.rowCount === 0) {
        // email must have already existed
        if (req.body.email) return res.error(errors.registration.EMAIL_REGISTERED);

        // Access token already existed - for now, send back generic error
        // Because they should have used POST /oauth to create/auth
        return res.error(errors.internal.DB_FAILURE);
      }

      return res.json({ error: null, data: { id:result.rows[0].consumerId } });
    });
  });
};

/**
 * Delete consumer
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-consumer', req.uuid];
  logger.routes.debug(TAGS, 'deleting consumer ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = [
      'DELETE FROM users USING consumers',
        'WHERE users.id = consumers."userId"',
        'AND consumers.id = $1'
    ].join(' ');
    client.query(query, [+req.param('id') || 0], function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) return res.status(404).end();

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};

/**
 * Update consumer
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-consumer', req.uuid];
  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // start transaction
    var tx = new Transaction(client);
    tx.begin(function() {

      var
        query = "update consumers set"
      , values = []
      ;

      // Include only allowed fields in update
      for (var key in req.body){
        if (!(key in req.fields)) continue;
        query += ' "' + key + '" = $' + values.push(req.body[key]) + ', '
      }

      // Clean up last comma
      query = query.substring(0, query.length - 2);

      query += ' where consumers.id = $' + values.push(req.params.id);

      logger.db.debug(TAGS, query);

      // run update query
      client.query(query, values, function(error, result){
        if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);
        logger.db.debug(TAGS, result);

        // did the update occur?
        if (result.rowCount === 0) {
          tx.abort();
          // figure out what the problem was
          client.query('SELECT id FROM users WHERE id=$1', [+req.param('id') || 0], function(error, results) {
            if (results.rowCount == 0) {
              // id didnt exist
              return res.status(404).end();
            }
          });
          return;
        }

        // done
        tx.commit();
        return res.json({ error: null, data: null });
      });
    });
  });
};
