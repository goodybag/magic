
/*
 * Location resources
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}

  // Tables
, locations  = db.tables.locations
, schemas    = db.schemas
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * List locations
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-locations', req.uuid];
  logger.routes.debug(TAGS, 'fetching list of locations', {uid: 'more'});

  // retrieve pg client
  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = utils.selectAsMap(locations, req.fields)
      .from(locations);

    // add query filters
    if (req.param('businessId')) {
      query.where(locations.businessId.equals(+req.param('businessId') || 0));
    }
    if (!isNaN(+req.param('lat')) && !isNaN(+req.param('lon'))) {
      var lat = +req.param('lat'),
        lon = +req.param('lon'),
        range = (+req.param('range') || 1000);
      query.where('earth_box(ll_to_earth('+lat+','+lon+'), '+range+') @>ll_to_earth(lat, lon)');
    }
    query = utils.paginateQuery(req, query);

    // run data query
    client.query(query.toQuery(), function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);

      // run count query
      query = locations.select('COUNT(*) as count');
      if (req.param('businessId')) {
        query.where(locations.businessId.equals(+req.param('businessId') || 0));
      }
      client.query(query.toQuery(), function(error, countResult) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: dataResult.rows, meta: { total:countResult.rows[0].count } });
      });
    });
  });
};

/**
 * Get location
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-location', req.uuid];
  logger.routes.debug(TAGS, 'fetching location', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = utils.selectAsMap(locations, req.fields)
      .from(locations)
      .where(locations.id.equals(+req.param('locationId') || 0))
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
 * Insert location
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.create = function(req, res){
  var TAGS = ['create-location', req.uuid];

  // retrieve db client
  db.getClient(function(error, client){
    if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

    // validate input
    var error = utils.validate(req.body, schemas.locations);
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build create query
    var query = locations.insert(req.body).toQuery();

    logger.db.debug(TAGS, query.text);

    // run create query
    client.query(query.text+' RETURNING id', query.values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);
      var newLocation = result.rows[0];

      // create productLocations for all products related to the business
      var query = [
        'INSERT INTO "productLocations" ("productId", "locationId", "businessId", lat, lon)',
        'SELECT products.id, $1, $2, $3, $4 FROM products WHERE products."businessId" = $2'
      ].join(' ');
      client.query(query, [newLocation.id, req.body.businessId, req.body.lat, req.body.lon], function(error, result) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
          return res.json({ error: null, data: newLocation });        
      });
    });
  });
};

/**
 * Update location
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-location', req.uuid];

  // retrieve db client
  db.getClient(function(error, client){
    if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

    // build update query
    var query = locations
      .update(req.body)
      .where(locations.id.equals(+req.param('locationId')))
      .toQuery();

    logger.db.debug(TAGS, query.text);

    // run update query
    client.query(query.text, query.values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      // build productLocations update query
      var updates = [];
      if (typeof req.body.lat != 'undefined') { updates.push('lat='+parseFloat(req.body.lat)); }
      if (typeof req.body.lon != 'undefined') { updates.push('lon='+parseFloat(req.body.lon)); }
      if (!updates.length) {
        return res.json({ error: null, data: null });
      }

      // update related productLocations
      client.query('UPDATE "productLocations" SET '+updates.join(', ')+' WHERE "locationId"=$1', [req.param('locationId')], function(error, result) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: null });
      });
    });
  });
};

/**
 * Delete location
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.del = function(req, res){
  var TAGS = ['delete-location', req.uuid];

  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.error(errors.internal.DB_FAILURE, error);
    }

    var query = locations
      .delete()
      .where(locations.id.equals(req.param('locationId')))
      .toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text, query.values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};
