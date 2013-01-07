/**
 * Product Categories
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}

  // Tables
, productCategories = db.tables.productCategories
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * Get Product Category
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-productCategory', req.uuid];
  logger.routes.debug(TAGS, 'fetching product category ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = utils.selectAsMap(
      productCategories
    , req.fields
    ).from(
      productCategories
    ).where(
      productCategories.id.equals(req.params.id)
    ).toQuery();

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows[0] || null});
    });
  });
};

/**
 * List Product Categories
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-productCategories', req.uuid];
  logger.routes.debug(TAGS, 'fetching product categories', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = utils.selectAsMap(
      productCategories
    , req.fields
    ).from(
      productCategories
    );

    if (req.params.businessId){
      query = query.where(productCategories.businessId.equals(req.params.businessId));
    }
    query = utils.paginateQuery(req, query);

    client.query(query.toQuery(), function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows });
    });
  });
};

/**
 * Create Product Category
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-productCategories', req.uuid];
  logger.routes.debug(TAGS, 'creating user', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var category = {
      businessId: req.body.businessId || req.params.businessId
    , order     : req.body.order      || 0
    , isFeatured: req.body.isFeatured || false
    , name:       req.body.name
    };

    var error = utils.validate(category, db.schemas.productCategories);
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = productCategories.insert(category).toQuery();

    client.query(query.text + "RETURNING id", query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows[0] });
    });
  });
};

/**
 * Delete product-category
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-product-category', req.uuid];
  logger.routes.debug(TAGS, 'deleting product-category ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = productCategories.delete().where(
      productCategories.id.equals(req.params.id)
    ).toQuery();

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};

/**
 * Update productCategory - there's no data modification here, so no need to validate
 * since we've already validated in the middleware
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-productCategory', req.uuid];
  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    // Don't let them update the id
    delete req.body.id;

    // Only let them update certain fields
    var data;
    if (req.fields){
      var fieldsAvailable = 0;
      data = {};
      for (var key in req.body){
        if (req.fields.hasOwnProperty(key)){
          data[key] = req.body[key];
          fieldsAvailable++;
        }
      }

      // Trying to update things they're not allowed to
      if (fieldsAvailable === 0)
        return res.json({ error: errors.auth.NOT_ALLOWED, data: null }), logger.routes.error(TAGS, errors.auth.NOT_ALLOWED);
    }

    var query = productCategories.update(data || req.body).where(
      productCategories.id.equals(req.params.id)
    ).toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};
