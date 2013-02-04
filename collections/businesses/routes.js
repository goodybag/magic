/*
 * Business routes
 */

var
  db         = require('../../db')
, sql        = require('../../lib/sql')
, utils      = require('../../lib/utils')
, errors     = require('../../lib/errors')

, logger  = {}

, schemas    = db.schemas
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * Get business
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-business', req.uuid];
  logger.routes.debug(TAGS, 'fetching business ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'SELECT {fields} FROM businesses',
        'LEFT JOIN "businessTags" ON "businessTags"."businessId" = businesses.id',
        'WHERE businesses.id = $id AND businesses."isDeleted" = false',
        'GROUP BY businesses.id'
    ]);
    query.fields = sql.fields().add("businesses.*");
    query.$('id', +req.params.id || 0);
    query.fields.add('array_agg("businessTags"."tag") as tags');

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
 * Delete business
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-business', req.uuid];
  logger.routes.debug(TAGS, 'deleting business ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('UPDATE businesses SET "isDeleted"=true WHERE id=$id');
    query.$('id', +req.params.id || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};

/**
 * List businesses
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-businesses', req.uuid];
  logger.routes.debug(TAGS, 'fetching list of businesses');

  // retrieve pg client
  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var includes = [].concat(req.query.include);
    var includeLocations = includes.indexOf('locations') !== -1;
    var includeTags = includes.indexOf('tags') !== -1;

    var query = sql.query([
      'SELECT {fields} FROM businesses {locationJoin} {tagJoin}',
        '{where} GROUP BY businesses.id {sort} {limit}'
    ]);
    query.fields = sql.fields().add("businesses.*");
    query.where  = sql.where()
      .and('businesses."isDeleted" = false')
      .and('businesses."isEnabled" = true');
    query.sort   = sql.sort(req.query.sort || 'name');
    query.limit  = sql.limit(req.query.limit, req.query.offset);

    if (includeLocations) {
      query.locationJoin = 'LEFT JOIN locations ON locations."businessId" = businesses.id';
      // :TEMP: this is a temporary alternative to JSON functions that travis CI is forcing us to do those fuckers
      for (var locationColumn in schemas.locations) {
        if (locationColumn == 'position') continue;
        query.fields.add('array_agg(locations."'+locationColumn+'"::text) as "location_'+locationColumn+'"');
      }
    }

    // tag filtering
    if (req.query.tag) {
      var tagsClause = sql.filtersMap(query, '"businessTags".tag {=} $filter', req.query.tag);
      query.tagJoin = [
        'INNER JOIN "businessTags" ON',
          '"businessTags"."businessId" = businesses.id AND',
          tagsClause
      ].join(' ');
    }

    // tag include
    if (includeTags) {
      if (!req.query.tag) {
        query.tagJoin = [
          'LEFT JOIN "businessTags" ON',
            '"businessTags"."businessId" = businesses.id'
        ].join(' ');
      }
      query.fields.add('array_agg("businessTags".tag) as tags');
    }

    // name filter
    if (req.param('filter')) {
      query.where.and('businesses.name ILIKE $nameFilter');
      query.$('nameFilter', '%'+req.param('filter')+'%');
    }

    query.fields.add('COUNT(*) OVER() as "metaTotal"');

    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);

      var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
      if (total && typeof dataResult.rows[0].location_id != 'undefined') {
        // :TEMP: hack to replace array_to_json and shit
        dataResult.rows.forEach(function(r) {
          // create locations objects
          var locations = [];
          for (var i=0; i < r.location_id.length; i++) {
            locations.push({});
          }

          // extract data from row
          for (var col in schemas.locations) {
            var k = 'location_'+col;
            if (!r[k]) { continue; }
            r[k].forEach(function(v, i) {
              locations[i][col] = v;
            });
            delete r[k];
          }
          r.locations = locations;
        });
      }

      return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
     });
  });
};

/**
 * Insert business
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.create = function(req, res){
  var TAGS = ['create-business', req.uuid];

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // defaults
    var inputs = req.body;
    if (!inputs.cardCode) inputs.cardCode = "000000";
    if (!inputs.isEnabled) inputs.isEnabled = true;
    inputs.isDeleted = false;
    var tags = inputs.tags; delete inputs.tags;

    // validation
    var error = utils.validate(inputs, schemas.businesses);
    if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

    // query
    var query = sql.query('INSERT INTO businesses ({fields}) VALUES ({values}) RETURNING id');
    query.fields = sql.fields().addObjectKeys(inputs);
    query.values = sql.fields().addObjectValues(inputs, query);

    query.fields.add('"createdAt"').add('"updatedAt"');
    query.values.add('now()').add('now()');

    if (req.body.isGB == null || req.body.isGB == undefined){
      query.fields.add('"isGB"');
      query.values.add(false);
    }

    if (req.body.isVerified == null || req.body.isVerified == undefined){
      query.fields.add('"isVerified"');
      query.values.add(false);
    }

    logger.db.debug(TAGS, query.toString());

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      var business = result.rows[0];
      if (!tags) return res.json({ error: null, data: business });

      // add tags
      var query = 'INSERT INTO "businessTags" ("businessId", tag) VALUES ';
      query += tags.map(function(_, i) { return '($1, $'+(i+2)+')'; }).join(', ');
      client.query(query, [business.id].concat(tags), function(error, result) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: business });
      });
    });
  });
};

/**
 * Update business
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-business', req.uuid];
  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var inputs = req.body;
    var tags = inputs.tags;
    delete inputs.tags;

    // PG should be handling this
    delete inputs.createdAt;
    delete inputs.updatedAt;

    inputs.id = req.params.id; // make sure there's always something in the update

    var query = sql.query('UPDATE businesses SET {updates} WHERE id=$id');
    query.updates = sql.fields().addUpdateMap(inputs, query);
    query.updates.add('"updatedAt" = now()');
    query.$('id', req.params.id);

    logger.db.debug(TAGS, query.toString());
    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      if (typeof tags == 'undefined') return res.json({ error: null, data: null });

      client.query('DELETE FROM "businessTags" WHERE "businessId" = $1', [req.params.id], function(error, result) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        if (tags.length === 0) return res.json({ error: null, data: null });

        var query = 'INSERT INTO "businessTags" ("businessId", tag) VALUES ';
        query += tags.map(function(_, i) { return '($1, $'+(i+2)+')'; }).join(', ');
        client.query(query, [req.params.id].concat(tags), function(error, result) {
          if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

          return res.json({ error: null, data: null });
        });
      });
    });
  });
};

/**
 * Get business loyalty settings
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.getLoyalty = function(req, res){
  var TAGS = ['get-business-loyalty', req.uuid];
  logger.routes.debug(TAGS, 'fetching business ' + req.params.id + ' loyalty');

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'SELECT {fields} FROM "businessLoyaltySettings"',
        'WHERE "businessId" = $id'
    ]);
    query.fields = sql.fields().add('"businessLoyaltySettings".*');
    query.$('id', +req.params.id || 0);
    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      if (result.rowCount === 0)
        return res.json({ error: null, data: null });

      return res.json({ error: null, data: result.rows[0] });
    });
  });
};

/**
 * Update business loyalty settings
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.updateLoyalty = function(req, res){
  var TAGS = ['update-business-loyalty', req.uuid];
  logger.routes.debug(TAGS, 'updating business ' + req.params.id + ' loyalty');

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var updateQuery = sql.query('UPDATE "businessLoyaltySettings" SET {updates} WHERE "businessId"=$id');
    updateQuery.updates = sql.fields().addUpdateMap(req.body, updateQuery);
    updateQuery.$('id', req.params.id);

    var insertQuery = sql.query('INSERT INTO "businessLoyaltySettings" ({fields}) VALUES ({values})');
    insertQuery.fields = sql.fields().addObjectKeys(req.body);
    insertQuery.fields.add('"businessId"');
    insertQuery.values = sql.fields().addObjectValues(req.body, insertQuery);
    insertQuery.values.add(req.param('id'));

    db.upsert(
      client
    , updateQuery.toString()
    , updateQuery.$values
    , insertQuery.toString()
    , insertQuery.$values
    , function(error, result){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        logger.db.debug(TAGS, result);

        return res.json({ error: null, data: null });
      }
    );
  });
};