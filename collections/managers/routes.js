/**
 * Managers
 */

var
  singly  = require('singly')
, db      = require('../../db')
, sql     = require('../../lib/sql')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config  = require('../../config')
, magic       = require('../../lib/magic')

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

  var query = sql.query([
                        'SELECT {fields} FROM users',
                        'JOIN "managers" ON "managers".id = users.id',
                        'WHERE users.id = $id'
  ]);
  query.fields = sql.fields().add('managers.*, users.*');
  query.$('id', +req.param('id') || 0);

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    if (result.rowCount == 1) {
      return res.json({ error: null, data: result.rows[0] });
    } else {
      return res.status(404).end();
    }
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

  // build data query
  var query = sql.query([
    'SELECT {fields} FROM managers',
      'INNER JOIN users ON managers.id = users.id',
      '{where} {limit}'
  ]);
  query.fields = sql.fields().add('managers.*, users.*');
  query.where  = sql.where();
  query.limit  = sql.limit(req.query.limit, req.query.offset);

  if (req.param('filter')) {
    query.where.and('users.email ILIKE $emailFilter');
    query.$('emailFilter', '%'+req.param('filter')+'%');
  }

  if (req.param('businessId')) {
    query.where.and('managers."businessId" = $businessId');
    query.$('businessId', req.param('businessId'));
  }

  if (req.param('locationId')) {
    query.where.and('managers."locationId" = $locationId');
    query.$('locationId', req.param('locationId'));
  }

  query.fields.add('COUNT(*) OVER() as "metaTotal"');

  // run data query
  db.query(query, function(error, rows, dataResult){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
    return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
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

  db.procedures.setLogTags(TAGS);
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

  var query = sql.query('DELETE FROM users WHERE users.id = $id');
  query.$('id', +req.params.id || 0);

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
    if (result.rowCount === 0) return res.status(404).end();

    res.noContent();
  });
};

/**
 * Update manager
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res, next) {
var TAGS = ['update-manager', req.uuid];
  logger.routes.debug(TAGS, 'updating manager ' + req.params.id);

  var userId = req.param('id');
  if (req.param('id') == 'session')
    userId = req.session.user.id;

  db.procedures.setLogTags(TAGS);

  //make sure there is a record in the manager table
  //for this user. This allows you to 'promote' a user to a manager
  var queryText = 'INSERT INTO managers ("id") '+
    'SELECT users.id FROM users WHERE users.id = $1 ' +
    ' AND NOT EXISTS(SELECT managers."id" from managers WHERE managers."id" = $1)';
  db.query(queryText, [userId], function(err, rows) {
    db.procedures.updateUser('manager', userId, req.body, function(error, result) {
      if (error) return res.error(error, result), logger.routes.error(TAGS, result);
      res.noContent();
    });
  });
};
