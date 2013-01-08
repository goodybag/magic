
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
    if (error) return res.json({ error: error, data: null, meta: null }), logger.routes.error(TAGS, error);

    // build data query
    var query = utils.selectAsMap(locations, req.fields)
      .from(locations);

    // add query filters
    if (req.param('businessId')) {
      query.where(locations.businessId.equals(req.param('businessId')));
    }
    query = utils.paginateQuery(req, query);

    // run data query
    client.query(query.toQuery(), function(error, dataResult){
      if (error) return res.json({ error: error, data: null, meta: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);

      // run count query
      query = locations.select('COUNT(*) as count');
      if (req.param('businessId')) {
        query.where(locations.businessId.equals(req.param('businessId')));
      }
      client.query(query.toQuery(), function(error, countResult) {
        if (error) return res.json({ error: error, data: null, meta: null }), logger.routes.error(TAGS, error);

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
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = utils.selectAsMap(locations, req.fields)
      .from(locations)
      .where(locations.id.equals(req.param('locationId')))
      .toQuery();


    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows[0] || null });
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

  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    var error = utils.validate(req.body, schemas.locations);
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = locations.insert(req.body).toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text+' RETURNING id', query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows[0] });
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

  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    var query = locations
      .update(req.body)
      .where(locations.id.equals(req.param('locationId')))
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
 * Delete location
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.del = function(req, res){
  var TAGS = ['delete-location', req.uuid];

  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    var query = locations
      .delete()
      .where(locations.id.equals(req.param('locationId')))
      .toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};
