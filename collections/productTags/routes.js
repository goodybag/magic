
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
    var query = productTags.select('DISTINCT tag')
      .from(productTags);

    // filters
    if (req.param('businessId')) {
      query.where(productTags.businessId.equals(req.param('businessId')));
    }
    if (req.param('productId')) {
      query.where(productTags.productId.equals(req.param('productId')));
    }
    query = utils.paginateQuery(req, query);

    // run data query
    client.query(query.toQuery(), function(error, dataResult){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);

      // collect count filters
      var filters = [];
      if (req.param('businessId')) {
        filters.push('"businessId" = \'' + parseInt(req.param('businessId'), 10) + '\'');
      }
      if (req.param('productId')) {
        filters.push('"productId" = \'' + parseInt(req.param('productId'), 10) + '\'');
      }
      filters = (filters.length > 0) ? ('WHERE ' + filters.join(' AND ')) : '';

      // build count query
      var query = [
        'WITH agg AS (',
          'SELECT DISTINCT(tag) FROM "productTags"', (filters), 'GROUP BY tag',
        ')',
        'SELECT COUNT(*) as count FROM agg;'
      ].join(' ')

      // run count query
      client.query(query, function(error, countResult) {
        if (error) return res.json({ error: error, data: null, meta: null }), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: dataResult.rows, meta: { total:countResult.rows[0].count } });
      });
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

  // retrieve pg client
  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    // build query
    var query = productTags
      .update(req.body)
      .where(productTags.tag.equals(req.param('tag')));

    // add filters
    if (req.param('businessId')) {
      query.where(productTags.businessId.equals(req.param('businessId')));
    }
    if (req.param('productId')) {
      query.where(productTags.productId.equals(req.param('productId')));
    }

    // run query
    client.query(query.toQuery(), query.values, function(error, result){
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

  // retrieve pg client
  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    // build query
    var query = productTags
      .delete()
      .where(productTags.tag.equals(req.param('tag')))

    // add filters
    if (req.param('businessId')) {
      query.where(productTags.businessId.equals(req.param('businessId')));
    }
    if (req.param('productId')) {
      query.where(productTags.productId.equals(req.param('productId')));
    }

    // run query
    client.query(query.toQuery(), function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};
