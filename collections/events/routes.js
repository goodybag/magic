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
  var TAGS = ['get-users', req.uuid];
  logger.routes.debug(TAGS, 'fetching user ' + req.params.id);

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('select e.* from (select id, type, date, to_json(data::hstore) as data from events where id = $id {limit}) as e');
    query.$('id', +req.param('id') || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      if (result.rowCount == 1) {
        result.rows[0].data = JSON.parse(result.rows[0].data);
        return res.json({ error: null, data: result.rows[0] });
      } else {
        return res.error({ error: errors.input.NOT_FOUND, data: null });
      }
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
  logger.routes.debug(TAGS, 'fetching users ' + req.params.id);

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('select e.* from (select id, type, date, to_json(data::hstore) as data from events {where} {limit}) as e');
    query.where = sql.where();
    query.limit = sql.limit(req.query.limit, req.query.offset);

    if (req.param('filter')){
      query.where.and('events.type ILIKE $typeFilter');
      query.$('typeFilter', '%' + req.param('filter') + '%');
    }

    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return console.log(error), res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, dataResult);

      var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;

      dataResult.rows = dataResult.rows.map(function(r){
        r.data = JSON.parse(r.data);
        return r;
      });

      return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
    });
  });
};
