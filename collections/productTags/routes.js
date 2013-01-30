
/*
 * Product Tags resources
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}

  // Tables
, productTags = db.tables.productTags
, productsProductTags = db.tables.productsProductTags
, products = db.tables.products
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

  // retrieve pg client
  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = productTags.select('"productTags".*')
      .from(productTags);

    // filters
    if (req.param('businessId')) {
      query.where(productTags.businessId.equals(req.param('businessId')));
    }
    query = utils.paginateQuery(req, query);

    // run data query
    client.query(query.toQuery(), function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);

      // run count query
      query = productTags.select('COUNT(*) as count');
      if (req.param('businessId')) {
        query.where(productTags.businessId.equals(req.param('businessId')));
      }
      client.query(query.toQuery(), function(error, countResult) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: dataResult.rows, meta: { total:countResult.rows[0].count } });
      });
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

  // retrieve client
  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = productTags.select('"productTags".*')
      .from(productTags)
      .where(productTags.id.equals(req.param('tagId')));

    // run data query
    client.query(query.toQuery(), function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      if (result.rows.length <= 0) return res.json({ error: null, data: null});
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

  // retrieve pg client
  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.error(errors.internal.DB_FAILURE, error);
    }

    // validate
    var data = req.body;
    data.businessId = req.param('businessId');
    var error = utils.validate(data, db.schemas.productTags);
    if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

    // build query
    //var query = productTags.insert(req.body).toQuery();
    //logger.db.debug(TAGS, query.text);
    var query = 'INSERT INTO "productTags" ("businessId", tag) SELECT $1, $2 WHERE NOT EXISTS (SELECT id from "productTags" WHERE "businessId" = $1 AND tag = $2) RETURNING id';

    // run query
    client.query(query, [data.businessId, data.tag], function(error, result){
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

  // retrieve pg client
  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.error(errors.internal.DB_FAILURE, error);
    }

    // build query
    var query = productTags
      .update({ tag:req.body.tag })
      .where(productTags.id.equals(req.param('tagId')))
      .where(productTags.businessId.equals(req.param('businessId')));

    // run query
    client.query(query.toQuery(), function(error, result){
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

  // retrieve pg client
  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.error(errors.internal.DB_FAILURE, error);
    }

    // build query
    var query = productTags
      .delete()
      .where(productTags.id.equals(req.param('tagId')))
      .where(productTags.businessId.equals(req.param('businessId')));

    // run query
    client.query(query.toQuery(), function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};
