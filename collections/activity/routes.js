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
 * Get activity
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-activity', req.uuid];
  logger.routes.debug(TAGS, 'fetching activity ' + req.params.id);

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('select id, type, date, to_json(data) as data from activity where id = $id {limit}');
    query.$('id', +req.param('id') || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (result.rowCount == 1) {
        result.rows[0].data = JSON.parse(result.rows[0].data);
        return res.json({ error: null, data: result.rows[0] });
      } else {
        return res.error(errors.input.NOT_FOUND);
      }
    });
  });
};

/**
 * List activity
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-activity', req.uuid];
  logger.routes.debug(TAGS, 'fetching activity ' + req.params.id);

  var query = {}, options = { order: 'id desc' };

  // if (req.param('filter'))      query.type = '%' + req.param('filter') + '%';
  if (req.param('userId'))     query.userId     = req.param('userId');
  if (req.param('businessId')) query.businessId = req.param('businessId');
  if (req.param('locationId')) query.locationId = req.param('locationId');

  db.api.activity.setLogTags(TAGS);
  db.api.activity.find(query, options, function(error, results, meta){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    results = results.map(function(r){
      try {
        r.data = JSON.parse(r.data);
      } catch (e) {
        r.data = null;
      }
      return r;
    });

    return res.json({ error: null, data: results, meta: meta });
  });
};
