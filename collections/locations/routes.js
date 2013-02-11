
/*
 * Location resources
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, sql     = require('../../lib/sql')
, errors  = require('../../lib/errors')

, logger  = {}

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
  logger.routes.debug(TAGS, 'fetching list of locations');

  // retrieve pg client
  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // if sort=distance, validate that we got lat/lon
    if (req.query.sort && req.query.sort.indexOf('distance') !== -1) {
      if (!req.query.lat || !req.query.lon) {
        return res.error(errors.input.VALIDATION_FAILED, 'Sort by \'distance\' requires `lat` and `lon` query parameters be specified');
      }
    }
    var includes = [].concat(req.query.include);
    var includeTags = includes.indexOf('tags') !== -1;

    // build data query
    var query = sql.query(
      'SELECT {fields} FROM locations {tagJoin} {where} GROUP BY locations.id {sort} {limit}'
    );
    query.fields = sql.fields().add(db.fields.locations.withTable.exclude('isEnabled'));
    query.where  = sql.where();
    query.sort   = sql.sort(req.query.sort || '+name');
    query.limit  = sql.limit(req.query.limit, req.query.offset);

    // Show all or just enabled locatins
    if (!req.query.all){
      query.where.and('"isEnabled" = true');
    } else {
      query.fields.add('"isEnabled"');
    }

    // business filtering
    if (req.param('businessId')) { // use param() as this may come from the path or the query
      query.where.and('"businessId" = $businessId');
      query.$('businessId', req.param('businessId'));
    }

    // location filtering
    if (req.query.lat && req.query.lon) {
      query.fields.add('earth_distance(ll_to_earth($lat,$lon), position) AS distance')
      query.$('lat', req.query.lat);
      query.$('lon', req.query.lon);
      if (req.query.range) {
        query.where.and('earth_box(ll_to_earth($lat,$lon), $range) @> ll_to_earth(lat, lon)');
        query.$('range', req.query.range);
      }
    }

    // tag filtering
    if (req.query.tag) {
      var tagsClause = sql.filtersMap(query, '"businessTags".tag {=} $filter', req.query.tag);
      query.tagJoin = [
        'INNER JOIN "businessTags" ON',
          '"businessTags"."businessId" = locations."businessId" AND',
          tagsClause
      ].join(' ');
    }

    // tag include
    if (includeTags) {
      if (!req.query.tag) {
        query.tagJoin = [
          'LEFT JOIN "businessTags" ON',
            '"businessTags"."businessId" = locations."businessId"'
        ].join(' ');
      }
      query.fields.add('array_agg("businessTags".tag) as tags');
    }

    // random sort
    if (req.query.sort) {
      if(req.query.sort.indexOf('random') !== -1) {
        query.fields.add('random() as random'); // this is really inefficient
      }
    }

    query.fields.add('COUNT(*) OVER() as "metaTotal"');

    // run data query
    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);
      var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;

      return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
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
  logger.routes.debug(TAGS, 'fetching location');

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('SELECT {fields} FROM locations WHERE id=$id');
    query.fields = sql.fields().add("locations.*");
    query.$('id', +req.param('locationId') || 0);

    client.query(query.toString(), query.$values, function(error, result){
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

  var inputs = req.body;

  // validate input
  var error = utils.validate(inputs, schemas.locations);
  if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

  // retrieve db client
  db.getClient(TAGS[0], function(error, client){
    if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

    // build query
    var query = sql.query('INSERT INTO locations ({fields}) VALUES ({values}) RETURNING id');
    query.fields = sql.fields().addObjectKeys(inputs);
    query.values = sql.fields().addObjectValues(inputs, query);

    // add calculations
    query.fields.add('position');
    query.values.add('(ll_to_earth('+parseFloat(inputs.lat)+','+parseFloat(inputs.lon)+'))');

    logger.db.debug(TAGS, query.toString());

    // run create query
    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);
      var newLocation = result.rows[0];

      // create productLocations for all products related to the business
      var query = sql.query([
        'INSERT INTO "productLocations" ("productId", "locationId", "businessId", lat, lon, position)',
        'SELECT products.id, $locationId, $businessId, $lat, $lon, ll_to_earth($lat, $lon) FROM products WHERE products."businessId" = $businessId'
      ]);
      query.$('locationId', newLocation.id);
      query.$('businessId', inputs.businessId);
      query.$('lat', inputs.lat);
      query.$('lon', inputs.lon);
      client.query(query.toString(), query.$values, function(error, result) {
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
  db.getClient(TAGS[0], function(error, client){
    if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

    var inputs = req.body;

    var query = sql.query('UPDATE locations SET {updates} WHERE id=$id');
    query.updates = sql.fields().addUpdateMap(inputs, query);
    query.$('id', req.param('locationId'));

    var isUpdatingPosition = (typeof inputs.lat != 'undefined' || typeof inputs.lon != 'undefined');
    var lat = inputs.lat ? parseFloat(inputs.lat) : 'lat';
    var lon = inputs.lon ? parseFloat(inputs.lon) : 'lon';
    if (isUpdatingPosition) {
      query.updates.add('position = (ll_to_earth('+lat+','+lon+'))');
    }

    logger.db.debug(TAGS, query.toString());

    // run update query
    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      // do we need to update the productLocations?
      if (isUpdatingPosition) {
        return res.json({ error: null, data: null });
      }

      // update related productLocations
      var query = sql.query('UPDATE "productLocations" SET {updates} WHERE "locationId"=$id');
      query.updates = sql.fields().addUpdateMap({lat:lat, lon:lon}, query);
      query.updates.add('position = (ll_to_earth('+lat+','+lon+'))');
      query.$('id', req.param('locationId'));

      client.query(query.toString(), query.$values, function(error, result) {
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

  db.getClient(TAGS[0], function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.error(errors.internal.DB_FAILURE, error);
    }

    var query = sql.query('DELETE FROM locations WHERE id=$id');
    query.$('id', req.param('locationId'));

    logger.db.debug(TAGS, query.toString());

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};

/**
 * Get location analytics
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.getAnalytics = function(req, res){
  var TAGS = ['get-location-analytics', req.uuid];
  logger.routes.debug(TAGS, 'fetching location analytics');

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query1 = sql.query([
      'SELECT {fields} FROM "productLocations"',
        'LEFT JOIN "productLikes" ON "productLikes"."productId" = "productLocations"."productId" AND "productLikes"."createdAt" > {startDate}',
        'LEFT JOIN "productWants" ON "productWants"."productId" = "productLocations"."productId" AND "productWants"."createdAt" > {startDate}',
        'LEFT JOIN "productTries" ON "productTries"."productId" = "productLocations"."productId" AND "productTries"."createdAt" > {startDate}',
        'WHERE "productLocations"."locationId"=$locationId GROUP BY "productLocations"."locationId"'
    ]);
    query1.$('locationId', +req.param('locationId') || 0);
    query1.fields = sql.fields();
    query1.fields.add('COUNT(DISTINCT "productLikes".id) AS likes');
    query1.fields.add('COUNT(DISTINCT "productWants".id) AS wants');
    query1.fields.add('COUNT(DISTINCT "productTries".id) AS tries');

    var query2 = sql.query([
      'SELECT {fields} FROM events',
        "WHERE (data::hstore->'locationId' = $locationId::text",
          "OR CAST(data::hstore->'tapinStationId' as integer) IN (SELECT id FROM \"tapinStations\" WHERE \"locationId\"=$locationId::integer)",
          "OR CAST(data::hstore->'businessId' as integer) = (SELECT businesses.id FROM businesses INNER JOIN locations ON businesses.id=locations.\"businessId\" AND locations.id=$locationId::integer LIMIT 1))",
          'AND date > {startDate}'
    ]);
    query2.$('locationId', +req.param('locationId') || 0);
    query2.fields = sql.fields();
    query2.fields.add("SUM(CASE WHEN type='loyalty.punch' OR type='loyalty.redemption' THEN CAST(data::hstore->'deltaPunches' AS integer) ELSE 0 END) AS punches");
    query2.fields.add("SUM(CASE WHEN type='loyalty.redemption' THEN 1 ELSE 0 END) AS redemptions");
    query2.fields.add("SUM(CASE WHEN type='consumers.visit' THEN 1 ELSE 0 END) AS visits");
    query2.fields.add("SUM(CASE WHEN type='consumers.visit' AND data::hstore->'isFirstVisit' = 'true' THEN 1 ELSE 0 END) AS \"firstVisits\"");
    query2.fields.add("SUM(CASE WHEN type='consumers.visit' AND data::hstore->'isFirstVisit' = 'false' THEN 1 ELSE 0 END) AS \"returnVisits\"");
    query2.fields.add("SUM(CASE WHEN type='consumers.tapin' THEN 1 ELSE 0 END) AS tapins");
    query2.fields.add("SUM(CASE WHEN type='consumers.becameElite' THEN 1 ELSE 0 END) AS \"becameElites\"");

    var query3 = sql.query([
      'SELECT {fields} FROM photos',
        'INNER JOIN locations',
          'ON locations."businessId" = photos."businessId"',
          'AND locations.id = $locationId',
        'WHERE "consumerId" IS NOT NULL',
          'AND "createdAt" > {startDate}'
    ]);
    query3.$('locationId', +req.param('locationId') || 0);
    query3.fields = sql.fields();
    query3.fields.add('COUNT(DISTINCT photos.id) as photos');

    var queries = [];
    function addQueryset(start) {
      query1.startDate = query2.startDate = query3.startDate = start;
      queries.push({q:query1.toString(), v:query1.$values});
      queries.push({q:query2.toString(), v:query2.$values});
      queries.push({q:query3.toString(), v:query3.$values});
    }
    addQueryset("now() - '1 day'::interval"); // past 24 hours
    addQueryset("now() - '1 week'::interval"); // past week
    addQueryset("now() - '1 month'::interval"); // past month
    addQueryset("'1-1-1969'::date"); // all time

    require('async').map(queries, function(item, next) {
      // console.log(item);
      client.query(item.q, item.v, next);
    }, function(error, results) {
      // console.log(error)
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, results);

      if (results[0].rowCount === 0) {
        return res.status(404).end();
      }

      var stats = {
        day   : utils.extend(results[0].rows[0], results[1].rows[0], results[2].rows[0]),
        week  : utils.extend(results[3].rows[0], results[4].rows[0], results[5].rows[0]),
        month : utils.extend(results[6].rows[0], results[7].rows[0], results[8].rows[0]),
        all   : utils.extend(results[9].rows[0], results[10].rows[0], results[11].rows[0]),
      };
      // console.log(stats);

      return res.json({ error: null, data: stats });
    });
  });
};

/**
 * Submit Keytag request
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.submitKeyTagRequest = function(req, res){
  var TAGS = ['get-location-analytics', req.uuid];
  logger.routes.debug(TAGS, 'fetching location analytics');

  var $update = { lastKeyTagRequest: 'now', keyTagRequestPending: true };

  db.locations.update(req.param('locationId'), $update, function(error){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    return res.json({ error: null, data: null }):
  });
};