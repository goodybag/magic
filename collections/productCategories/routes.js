/**
 * Product Categories
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
 * Get Product Category
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-productCategory', req.uuid];
  logger.routes.debug(TAGS, 'fetching product category ' + req.params.id);

  // retrieve pg client
  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = sql.query('SELECT * FROM "productCategories" WHERE id=$id');
    query.$('id', +req.params.id || 0)

    // run data query
    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
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
  logger.routes.debug(TAGS, 'fetching product categories');

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('SELECT *, COUNT(*) OVER() AS "metaTotal" FROM "productCategories" {where} {sort} {limit}');
    query.where = sql.where();
    query.sort  = sql.sort('"productCategories".order');
    query.limit = sql.limit(req.query.limit, req.query.offset);

    if (req.params.businessId){
      query.where.and('"businessId" = $businessId');
      query.$('businessId', req.params.businessId);
    }

    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
      return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
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
  logger.routes.debug(TAGS, 'creating user');

  var inputs = {
    businessId:  req.body.businessId || req.params.businessId
  , order:       req.body.order      || 0
  , isFeatured:  req.body.isFeatured || false
  , name:        req.body.name
  , description: req.body.description || ''
  };

  var error = utils.validate(inputs, db.schemas.productCategories);
  if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('INSERT INTO "productCategories" ({fields}) VALUES ({values}) RETURNING id');
    query.fields = sql.fields().addObjectKeys(inputs);
    query.values = sql.fields().addObjectValues(inputs, query);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

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
  logger.routes.debug(TAGS, 'deleting product-category ' + req.params.id);

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('DELETE FROM "productCategories" WHERE id=$id');
    query.$('id', +req.params.id || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      res.noContent();
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
  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var inputs = req.body;
    delete inputs.id; // Don't let them update the id

    if (require('underscore').isEmpty(inputs)) {
      return res.error(errors.input.VALIDATION_FAILED, 'Request body is empty');
    }

    var query = sql.query('UPDATE "productCategories" SET {updates} WHERE id=$prodCatId');
    query.updates = sql.fields().addUpdateMap(inputs, query);
    query.$('prodCatId', +req.params.id || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      res.noContent();
    });
  });
};
