
/*
 * Photo resources
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
 * List photos
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-photos', req.uuid];
  logger.routes.debug(TAGS, 'fetching list of photos');

  var query = sql.query('SELECT *, COUNT(*) OVER() as "metaTotal" FROM photos {where} {limit}');
  query.where = sql.where();
  query.limit = sql.limit(req.query.limit, req.query.offset);

  if (req.param('businessId')) {
    query.where.and('"businessId" = $businessId');
    query.$('businessId', req.param('businessId'));
  }
  if (req.param('productId')) {
    query.where.and('"productId" = $productId');
    query.$('productId', req.param('productId'));
  }
  if (req.param('userId')) {
    query.where.and('"userId" = $userId');
    query.$('userId', req.param('userId'));
  }

  db.query(query, function(error, rows, dataResult){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
    return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
  });
};

/**
 * Get photo
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-photo', req.uuid];
  logger.routes.debug(TAGS, 'fetching photo');


  var query = sql.query('SELECT * FROM photos WHERE id=$id');
  query.$('id', req.param('photoId'));

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    return res.json({ error: null, data: result.rows[0] || null});
  });
};

/**
 * Insert photo
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.create = function(req, res){
  var TAGS = ['create-photo', req.uuid];

  var inputs = req.body;
  inputs.userId = req.session.user.id;

  var error = utils.validate(inputs, db.schemas.photos);
  if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

  var query = sql.query('INSERT INTO photos ({fields}) (SELECT {values} FROM products WHERE id=$productId) RETURNING id');
  query.fields = sql.fields().addObjectKeys(inputs);
  query.values = sql.fields().addObjectValues(inputs, query);

  query.fields.add('"businessId"');
  query.values.add('products."businessId"');

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
    if (result.rowCount === 0)
      return res.error(errors.input.VALIDATION_FAILED, { productId:'Product ID specified does not exist' });
    return res.json({ error: null, data: result.rows[0] });
  });
};

/**
 * Update photo
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-photo', req.uuid];

  var inputs = req.body;

  var query = sql.query('UPDATE photos SET {updates} WHERE id=$photoId');
  query.updates = sql.fields().addUpdateMap(inputs, query);
  query.$('photoId', req.param('photoId'));

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
    res.noContent();
  });
};

/**
 * Delete photo
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.del = function(req, res){
  var TAGS = ['delete-photo', req.uuid];

  var query = sql.query('DELETE FROM photos WHERE id=$id');
  query.$('id', req.param('photoId'));

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
    res.noContent();
  });
};
