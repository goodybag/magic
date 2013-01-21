
/*
 * Loyalty Stats resources
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}

, TextNode = require('sql/lib/node/text')

  // Tables
, userLoyaltyStats = db.tables.userLoyaltyStats
, consumers        = db.tables.consumers
, schemas          = db.schemas
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

/**
 * Get Loyalty Stats
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 * :NOTE: req.body.consumerId will be correctly filled by the permissions middleware
 *        (if it's not, the route will be stopped due to lack of credentials)
 */
module.exports.get = function(req, res){
  var TAGS = ['get-loyaltystats', req.uuid];
  logger.routes.debug(TAGS, 'fetching loyaltystats', {uid: 'more'});

  // 404 if not a consumer
  if (!req.body.consumerId) {
    return res.status(404).end();
  }

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // get stats
    var query = utils.selectAsMap(userLoyaltyStats, req.fields)
      .from(userLoyaltyStats)
      .where(userLoyaltyStats.consumerId.equals(req.body.consumerId));

    client.query(query.toQuery(), function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      var stats = result.rows[0];

      if (result.rowCount === 0 || !stats) {
        // generate a blank record
        stats = {};
        for (var key in req.fields) {
          if (key == 'userId')
            stats[key] = req.session.user.id;
          else
            stats[key] = 0;
        }
      }

      return res.json({ error: null, data: stats });
    });
  });
};

/**
 * Update Loyalty Stats
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-loyaltystats', req.uuid];

  db.getClient(function(error, client){
    if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

    // validate
    var deltaPunches = +req.body.deltaPunches;
    if (isNaN(deltaPunches) || typeof deltaPunches == 'undefined') {
      var error = { deltaPunches:{ field:'deltaPunches', message:'Must be a valid integer.', validator:'isInt' }};
      return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);
    }
    var consumerId = +req.body.consumerId;
    if (isNaN(consumerId) || typeof consumerId == 'undefined') {
      var error = { consumerId:{ field:'consumerId', message:'Must be a valid integer.', validator:'isInt' }};
      return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);
    }

    // run stats upsert
    db.upsert(client,
      'UPDATE "userLoyaltyStats" SET ' + [
        '"numPunches"   = "numPunches"+$2',
        '"totalPunches" = "totalPunches"+$2'
      ].join(', ') + ' WHERE "consumerId"=$1',
      [consumerId, deltaPunches],
      'INSERT INTO "userLoyaltyStats" '+
        '("consumerId", "numPunches", "totalPunches", "visitCount", "lastVisit") ' +
        'SELECT $1, $2, $2, 0, now() WHERE NOT EXISTS '+
          '(SELECT 1 FROM "userLoyaltyStats" WHERE "consumerId"=$1)',
      [consumerId, deltaPunches],
      function(error, result) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
        logger.db.debug(TAGS, result);

        return res.json({ error: null, data: null });
      }
    );
  });
};
