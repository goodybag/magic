/*
 * Charities routes
 */

var
  db         = require('../../db')
, sql        = require('../../lib/sql')
, utils      = require('../../lib/utils')
, errors     = require('../../lib/errors')

, logger  = {}

, schemas   = db.schemas
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * Get charities
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-charities', req.uuid];
  logger.routes.debug(TAGS, 'fetching charities ' + req.params.id);

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('SELECT {fields} FROM charities WHERE id=$id');
    query.fields = sql.fields().add("charities.*");
    query.$('id', +req.params.id || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      if (result.rowCount === 0) {
        return res.status(404).end();
      }

      return res.json({ error: null, data: result.rows[0] });
    });
  });
};

/**
 * Delete charities
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-charity', req.uuid];
  logger.routes.debug(TAGS, 'deleting charity ' + req.params.id);

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('DELETE FROM charities WHERE id=$id');
    query.$('id', +req.params.id || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};

/**
 * List charities
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-charities', req.uuid];
  logger.routes.debug(TAGS, 'fetching list of charities');

  // retrieve pg client
  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('SELECT {fields} FROM charities {where} {limit}');
    query.fields = sql.fields().add("charities.*");
    query.where  = sql.where();
    query.limit  = sql.limit(req.query.limit, req.query.offset);

    if (req.param('filter')) {
      query.where.and('charities.name ILIKE $nameFilter');
      query.$('nameFilter', '%'+req.param('filter')+'%');
    }

    query.fields.add('COUNT(*) OVER() as "metaTotal"');

    // run data query
    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);

      var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
      return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
    });
  });
};


/**
 * Insert charity
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.create = function(req, res){
  var TAGS = ['create-charity', req.uuid];

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var inputs = req.body;

    var error = utils.validate(inputs, schemas.charities);
    if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

    var query = sql.query('INSERT INTO charities ({fields}) VALUES ({values}) RETURNING id');
    query.fields = sql.fields().addObjectKeys(inputs);
    query.values = sql.fields().addObjectValues(inputs, query);

    logger.db.debug(TAGS, query.toString());

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows[0] });
    });
  });
};

/**
 * Update charity - there's no data modification here, so no need to validate
 * since we've already validated in the middleware
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-charity', req.uuid];
  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var inputs = req.body;

    var query = sql.query('UPDATE charities SET {updates} WHERE id=$id');
    query.updates = sql.fields().addUpdateMap(inputs, query);
    query.$('id', +req.params.id || 0)

    logger.db.debug(TAGS, query.toString());

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};
