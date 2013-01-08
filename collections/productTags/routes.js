
/*
 * Product Tags resources
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}

  // Tables
, productTags  = db.tables.productTags
, products = db.tables.products
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * List productTags
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-productTags', req.uuid];
  logger.routes.debug(TAGS, 'fetching list of productTags', {uid: 'more'});

  // retrieve pg client
  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    // build data query
    var query = utils.selectAsMap(productTags, req.fields)
      .from(productTags);

    // filters
    var filters = null; // :TEMPORARY:
    ['businessId', 'productId'].forEach(function(filterName) {
      if (req.param(filterName)) {
        var filter = productTags[filterName].equals(req.param(filterName));
        if (!filters) {
          filters = filter;
        } else {
          filters = filters.and(filter);
        }
      }
    });
    if (filters) {
      query.where(filters);
    }
    query = utils.paginateQuery(req, query);

    // run data query
    client.query(query.toQuery(), function(error, dataResult){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);

      // run count query
      query = productTags.select('COUNT(*) as count');
      if (filters) { query.where(filters); }
      client.query(query.toQuery(), function(error, countResult) {
        if (error) return res.json({ error: error, data: null, meta: null }), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: dataResult.rows, meta: { total:countResult.rows[0].count } });
      });
    });
  });
};

/**
 * Get productTag
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-productTag', req.uuid];
  logger.routes.debug(TAGS, 'fetching productTag', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = utils.selectAsMap(productTags, req.fields)
      .from(productTags)
      .where(productTags.id.equals(req.param('productTagId')))
      .toQuery();


    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows[0] || null });
    });
  });
};

/**
 * Insert productTag
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.create = function(req, res){
  var TAGS = ['create-productTag', req.uuid];

  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    var error = utils.validate(req.body, db.schemas.productTags);
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = productTags.insert(req.body).toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text+' RETURNING id', query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows[0] });
    });
  });
};

/**
 * Update productTag
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-productTag', req.uuid];

  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    var query = productTags
      .update(req.body)
      .where(productTags.id.equals(req.param('productTagId')))
      .toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};

/**
 * Delete productTag
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.del = function(req, res){
  var TAGS = ['delete-productTag', req.uuid];

  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    var query = productTags
      .delete()
      .where(productTags.id.equals(req.param('productTagId')))
      .toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};
