/**
 * Groups
 */

var
  db          = require('../../db')
, sql         = require('../../lib/sql')
, utils       = require('../../lib/utils')
, errors      = require('../../lib/errors')
, Transaction = require('pg-transaction')
, async       = require('async')

, logger  = {}
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * Get group
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-groups', req.uuid];
  logger.routes.debug(TAGS, 'fetching groups ' + req.params.id);

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'SELECT {fields} FROM groups',
        'LEFT JOIN "usersGroups" ON "usersGroups"."groupId" = groups.id',
        'WHERE groups.id = $id',
        'GROUP BY groups.id'
    ]);
    query.fields = sql.fields().add("groups.*");
    query.$('id', +req.param('id') || 0);

    query.fields.add('array_agg("usersGroups"."userId") as users');

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
 * List groups
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-groups', req.uuid];
  logger.routes.debug(TAGS, 'fetching groups');

  var query = sql.query('SELECT {fields} FROM groups {limit}');
  query.fields = sql.fields().add("groups.*");
  query.limit  = sql.limit(req.query.limit, req.query.offset);

  query.fields.add('COUNT(*) OVER() as "metaTotal"');

  db.query(query, function(error, rows, dataResult){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
    return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
  });
};

/**
 * Create groups
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-groups', req.uuid];
  logger.routes.debug(TAGS, 'creating group');

  var query = sql.query([
    'WITH',
      '"group" AS (INSERT INTO groups (name) VALUES ($name) RETURNING ID)',
      '{userGroups}',
    'SELECT "group".id as id FROM "group"'
  ]);
  query.$('name', req.body.name);

  if (req.body.users && req.body.users.length) {
    query.userGroups = [', "userGroup" AS',
      '(INSERT INTO "usersGroups" ("groupId", "userId")',
        'SELECT "group".id, "users".id FROM "group", users WHERE users.id IN ({userIds}))'
    ].join(' ');
    query.userIds = [].concat(req.body.users).map(function(i) { return parseInt(i,10); }).join(',');
  }

  db.query(query, function(error, rows, result) {
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    return res.json({ error: null, data: result.rows[0] });
  });
};

/**
 * Delete group
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-group', req.uuid];
  logger.routes.debug(TAGS, 'deleting group ' + req.params.id);

  var query = sql.query('DELETE FROM groups WHERE id = $id');
  query.$('id', +req.param('id') || 0);

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    res.noContent();
  });
};

/**
 * Update group
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-group', req.uuid];
  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // start transaction
    var tx = new Transaction(client);
    tx.begin(function() {

      var inputs = {
        name    : req.body.name
      };

      // build update query
      var query = sql.query('UPDATE groups SET {updates} WHERE groups.id = $id');
      query.updates = sql.fields().addUpdateMap(inputs, query);
      query.$('id', +req.param('id') || 0);

      // run update query
      client.query(query.toString(), query.$values, function(error, result){
        if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

        // did the update occur?
        if (result.rowCount === 0) {
          tx.abort();
          // id didnt exist
          return res.status(404).end();
        }

        // delete all user relations
        var query = usersGroups.delete()
          .where(usersGroups.groupId.equals(req.param('id')));
        client.query(query.toQuery(), function(error, result) {
          if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

          // add new user relations
          async.series((req.body.users || []).map(function(userId) {
            return function(done) {
              var query = 'INSERT INTO "usersGroups" ("groupId", "userId") SELECT $1, $2 FROM users WHERE users.id = $2';
              client.query(query, [req.param('id'), userId], done);
            };
          }), function(err, results) {
            // did any insert fail?
            if (err || results.filter(function(r) { return r.rowCount === 0; }).length !== 0) {
              // the target user must not have existed
              tx.abort();
              return res.error(errors.input.INVALID_USERS);
            }

            // done
            tx.commit(function() { res.noContent(); });
          });

        });
      });
    });
  });
};
