/**
 * tapinStations
 */

var
  singly  = require('singly')

  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config  = require('../../config')

, logger  = {}
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

/**
 * Get tapinStation
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-tapinStations', req.uuid];
  logger.routes.debug(TAGS, 'fetching tapinStation ' + req.params.id);

  db.getClient(function(error, client) {
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'SELECT {fields} FROM users',
        'LEFT JOIN "tapinStations" ON "tapinStations"."userId" = users.id',
        'WHERE "tapinStations".id = $id'
    ]);
    query.fields = sql.fields().add('users.*, "tapinStations".*');
    query.$('id', +req.param('id') || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      if (result.rowCount == 1) {
        return res.json({ error: null, data: result.rows[0] });
      } else {
        return res.status(404).end();
      }
    });
  });
};

/**
 * List tapinStations
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-users', req.uuid];
  logger.routes.debug(TAGS, 'fetching users ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = sql.query([
      'SELECT {fields} FROM "tapinStations"',
        'INNER JOIN users ON "tapinStations"."userId" = users.id',
        '{where} {limit}'
    ]);
    query.fields = sql.fields().add('users.*, "tapinStations".*');
    query.where  = sql.where();
    query.limit  = sql.limit(req.query.limit, req.query.offset);

    if (req.param('filter')) {
      query.where.and('users.email ILIKE $emailFilter');
      query.$('emailFilter', '%'+req.param('filter')+'%');
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
 * Create tapinStations
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-tapinStations', req.uuid];
  logger.routes.debug(TAGS, 'creating tapinStation ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'WITH',
        '"user" AS',
          '(INSERT INTO users ({uidField}, {upassField}) SELECT $uid, $upass',
            'WHERE NOT EXISTS (SELECT 1 FROM users WHERE {uidField} = $uid)',
            'RETURNING id),',
        '"userGroup" AS',
          '(INSERT INTO "usersGroups" ("userId", "groupId")',
            'SELECT "user".id, groups.id FROM groups, "user" WHERE groups.name = \'tapin-station\' RETURNING id),',
        '"station" AS',
          '(INSERT INTO "tapinStations" ("userId", "businessId", "locationId", "loyaltyEnabled", "galleryEnabled")',
            'SELECT "user".id, $businessId, $locationId, $loyaltyEnabled, $galleryEnabled FROM "user" RETURNING id)',
      'SELECT "user".id as "userId", "station".id as "tapinStationId" FROM "user", "station"'
    ]);
    if (req.body.email) {
      query.uidField = 'email';
      query.upassField = 'password';
      query.$('uid', req.body.email);
      query.$('upass', utils.encryptPassword(req.body.password));
    } else {
      query.uidField = '"singlyId"';
      query.upassField = '"singlyAccessToken"';
      query.$('uid', req.body.singlyId);
      query.$('upass', req.body.singlyAccessToken);
    }
    query.$('businessId', req.body.businessId);
    query.$('locationId', req.body.locationId);
    query.$('loyaltyEnabled', !!req.body.loyaltyEnabled);
    query.$('galleryEnabled', !!req.body.galleryEnabled);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      // did the insert occur?
      if (result.rowCount === 0) {
        // email must have already existed
        if (req.body.email) return res.error(errors.registration.EMAIL_REGISTERED);

        // Access token already existed - for now, send back generic error
        // Because they should have used POST /oauth to create/auth
        return res.error(errors.internal.DB_FAILURE);
      }

      return res.json({ error: null, data: result.rows[0] });
    });
  });
};

/**
 * Delete user
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-user', req.uuid];
  logger.routes.debug(TAGS, 'deleting user ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'DELETE FROM users USING "tapinStations"',
        'WHERE users.id = "tapinStations"."userId"',
        'AND "tapinStations".id = $id'
    ]);
    query.$('id', +req.params.id || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) return res.status(404).end();

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};

/**
 * Update tapinStation
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-tapinStation', req.uuid];
  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('UPDATE "tapinStations" SET {updates} WHERE id=$id');
    query.updates = sql.fields().addUpdateMap(req.body, query);
    query.$('id', req.params.id);

    logger.db.debug(TAGS, query.toString());

    // run update query
    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      // did the update occur?
      if (result.rowCount === 0) {
        return res.status(404).end();
      }

      // done
      return res.json({ error: null, data: null });
    });
  });
};
