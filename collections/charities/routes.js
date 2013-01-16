/*
 * Charities routes
 */

var
  db         = require('../../db')
, utils      = require('../../lib/utils')
, errors     = require('../../lib/errors')

, logger  = {}

  // Tables
, charities = db.tables.charities
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
  logger.routes.debug(TAGS, 'fetching charities ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = utils.selectAsMap(charities, req.fields)
      .from(charities)
      .where(charities.id.equals(+req.params.id || 0))
      .toQuery();

    client.query(query.text, query.values, function(error, result){
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
  logger.routes.debug(TAGS, 'deleting charity ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = charities.delete().where(
      charities.id.equals(req.params.id)
    ).toQuery();

    client.query(query.text, query.values, function(error, result){
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
  logger.routes.debug(TAGS, 'fetching list of charities', {uid: 'more'});

  // retrieve pg client
  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = utils.selectAsMap(charities, req.fields)
      .from(charities);

    // add query filters
    if (req.param('filter')) {
      query.where('charities.name ILIKE \'%'+req.param('filter')+'%\'');
    }
    utils.paginateQuery(req, query);

    // run data query
    client.query(query.toQuery(), function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);

      // run count query
      client.query('SELECT COUNT(*) as count FROM charities', function(error, countResult) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: dataResult.rows, meta: { total:countResult.rows[0].count } });
      });
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

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    if (!req.body.cardCode) req.body.cardCode = "000000";
    if (!req.body.isEnabled) req.body.isEnabled = true;

    var error = utils.validate(req.body, schemas.charities);
    if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

    var query = charities.insert({
      'name'      :    req.body.name
    , 'desc'      :    req.body.desc
    , 'logoUrl'   :    req.body.logoUrl
    }).toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text + " RETURNING id", query.values, function(error, result){
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
  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = charities.update(req.body).where(
      charities.id.equals(req.params.id)
    ).toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text, query.values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};
