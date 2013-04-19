/**
 * cashiers
 */

var
  singly  = require('singly')

  db      = require('../../db')
, sql     = require('../../lib/sql')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config  = require('../../config')

, logger  = {}
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

/**
 * Get cashier
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res) {
  var TAGS = ['get-cashiers', req.uuid];
  logger.routes.debug(TAGS, 'fetching cashier ' + req.params.id);

  var query = sql.query([
    'SELECT {fields} FROM users',
      'LEFT JOIN "cashiers" ON "cashiers".id = users.id',
      'WHERE users.id = $id'
  ]);
  query.fields = sql.fields().add('cashiers.*, users.*');
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
 * List cashiers
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-cashiers', req.uuid];
  logger.routes.debug(TAGS, 'fetching cashiers ' + req.params.id);

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = sql.query([
      'SELECT {fields} FROM cashiers',
        'INNER JOIN users ON cashiers.id = users.id',
        '{where} {limit}'
    ]);
    query.fields = sql.fields().add('cashiers.*, users.*');
    query.where  = sql.where();
    query.limit  = sql.limit(req.query.limit, req.query.offset);

    if (req.param('filter')) {
      query.where.and('users.email ILIKE $emailFilter');
      query.$('emailFilter', '%'+req.param('filter')+'%');
    }

    if (req.param('businessId')) {
      query.where.and('cashiers."businessId" = $businessId');
      query.$('businessId', req.param('businessId'));
    }

    if (req.param('locationId')) {
      query.where.and('cashiers."locationId" = $locationId');
      query.$('locationId', req.param('locationId'));
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
 * Create cashiers
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-cashiers', req.uuid];
  logger.routes.debug(TAGS, 'creating cashier');

  db.procedures.setLogTags(TAGS);
  db.procedures.registerUser('cashier', req.body, function(error, result){
    if (error) return res.error(error, result), logger.routes.error(TAGS, result);

    res.json({ error: null, data: result });
    magic.emit('cashiers.registered', result);
  });
};

/**
 * Delete cashier
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-cashier', req.uuid];
  logger.routes.debug(TAGS, 'deleting cashier ' + req.params.id);

  db.getClient(TAGS, function(error, client){
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
 * Update cashier
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-cashier', req.uuid];
  logger.routes.debug(TAGS, 'updating cashier ' + req.params.id);

  var userId = req.param('id');
  if (req.param('id') == 'session')
    userId = req.session.user.id;

  db.procedures.setLogTags(TAGS);
  db.procedures.updateUser('cashier', userId, req.body, function(error, result) {
    if (error) return res.error(error, result), logger.routes.error(TAGS, result);
    res.noContent();
  });
};
