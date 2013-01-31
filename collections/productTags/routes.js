
/*
 * Product Tags resources
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
 * List tags
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-productTags', req.uuid];
  logger.routes.debug(TAGS, 'fetching list of productTags', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('SELECT *, COUNT(id) OVER() as "metaTotal" FROM "productTags" {where} {limit}');
    query.where = sql.where();
    query.limit = sql.limit(req.query.limit, req.query.offset);

    if (req.param('businessId')) {
      query.where.and('"businessId" = $businessId');
      query.$('businessId', req.param('businessId'));
    }

    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);

      var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
      return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
    });
  });
};

/**
 * Get tag
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-productTag', req.uuid];
  logger.routes.debug(TAGS, 'fetching productTag', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('SELECT * FROM "productTags" WHERE id=$tagId');
    query.$('tagId', +req.param('tagId') || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      if (result.rows.length <= 0) return res.json({ error: null, data: null });
      return res.json({ error: null, data: result.rows[0] });
    });
  });
};

/**
 * Insert tag
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.create = function(req, res){
  var TAGS = ['create-productTag', req.uuid];

  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.error(errors.internal.DB_FAILURE, error);
    }

    var inputs = req.body;
    inputs.businessId = req.param('businessId');

    var error = utils.validate(inputs, db.schemas.productTags);
    if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'INSERT INTO "productTags" ("businessId", tag)',
        'SELECT $businessId, $tag WHERE NOT EXISTS',
          '(SELECT id from "productTags" WHERE "businessId" = $businessId AND tag = $tag)',
        'RETURNING id'
    ]);
    query.$('businessId', inputs.businessId);
    query.$('tag', inputs.tag)

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows[0] });
    });
  });
};

/**
 * Update tag
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-productTag', req.uuid];

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('UPDATE "productTags" SET tag=$tag WHERE id=$id AND "businessId"=$businessId');
    query.$('tag', req.body.tag || '');
    query.$('id', +req.param('tagId') || 0);
    query.$('businessId', +req.param('businessId') || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};

/**
 * Delete tag
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.del = function(req, res){
  var TAGS = ['delete-productTag', req.uuid];

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('DELETE FROM "productTags" WHERE id=$id AND "businessId"=$businessId');
    query.$('id', +req.param('tagId') || 0);
    query.$('businessId', +req.param('businessId') || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};
