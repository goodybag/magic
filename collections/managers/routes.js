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
  var TAGS = ['list-managers', req.uuid];
  logger.routes.debug(TAGS, 'fetching managers');

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
  logger.routes.debug(TAGS, 'creating manager');

  db.procedures.registerUser('manager', req.body, function(error, result){
    if (error) return res.error(error, result), logger.routes.error(TAGS, result);

    res.json({ error: null, data: result });
    magic.emit('managers.registered', result);
  });
};

/**
 * Delete manager
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-manager', req.uuid];
  logger.routes.debug(TAGS, 'deleting manager ' + req.params.id);

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
  logger.routes.debug(TAGS, 'updating manager ' + req.params.id);

  var userId = req.param('id');
  if (req.param('id') == 'session')
    userId = req.session.user.id;

  db.procedures.updateUser('manager', userId, req.body, function(error, result) {
    if (error) return res.error(error, result), logger.routes.error(TAGS, result);
    res.noContent();
  });
};
