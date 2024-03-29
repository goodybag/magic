/**
 * Events
 */

var
  db      = require('../../db')
, sql     = require('../../lib/sql')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * Get event
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-events', req.uuid];
  logger.routes.debug(TAGS, 'fetching user ' + req.params.id);

  var query = sql.query('select e.* from (select id, type, date, to_json(data::hstore)::json as data from events where id = $id {limit}) as e');
  query.$('id', +req.param('id') || 0);

  db.query(query, function(error, rows, result) {
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    if (result.rowCount == 1) {
      return res.json({ error: null, data: result.rows[0] });
    } else {
      return res.error({ error: errors.input.NOT_FOUND, data: null });
    }
  });
};

/**
 * List events
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-events', req.uuid];
  logger.routes.debug(TAGS, 'fetching events ' + req.params.id);

  var query = sql.query('select e.* from (select id, type, date, to_json(data::hstore)::json as data from events {where} {limit}) as e');
  query.where = sql.where();
  query.limit = sql.limit(req.query.limit, req.query.offset);

  if (req.param('filter')){
    query.where.and('events.type ILIKE $typeFilter');
    query.$('typeFilter', '%' + req.param('filter') + '%');
  }

  db.query(query, function(error, rows, dataResult){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;

    return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
  });
};
