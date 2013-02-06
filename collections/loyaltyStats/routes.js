
/*
 * Loyalty Stats resources
 */

var
  db      = require('../../db')
, sql     = require('../../lib/sql')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}

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
  logger.routes.debug(TAGS, 'fetching loyaltystats');

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // ensure we have a consumer id
    var consumerId = req.body.consumerId;
    var getConsumerId = function(cb) { cb(); };
    if (!consumerId) {
      // no consumerId given, look it up off the authed user
      var query = 'SELECT id FROM consumers WHERE "userId" = $1';
      getConsumerId = function(cb) { client.query(query, [req.session.user.id], cb); };
    }

    getConsumerId(function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (!consumerId) {
        if (result.rowCount === 0) {
          return res.status(404).end();
        }
        consumerId = result.rows[0].id;
      }

      // get stats
      var query = sql.query('SELECT {fields} FROM "userLoyaltyStats" WHERE "userLoyaltyStats"."consumerId" = $consumerId');
      query.fields = sql.fields().add('"userLoyaltyStats".*');
      query.$('consumerId', consumerId);

      client.query(query.toString(), query.$values, function(error, result){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
        logger.db.debug(TAGS, result);

        return res.json({ error: null, data: result.rows });
      });
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

    var deltaPunches = req.body.deltaPunches;
    var consumerId = req.body.consumerId;
    var businessId = req.body.businessId;

    // ensure we have a consumer id
    var getConsumerId = function(cb) { cb(); };
    if (!consumerId) {
      // no consumerId given, look it up off the authed user
      var query = 'SELECT id FROM consumers WHERE "userId" = $1';
      getConsumerId = function(cb) { client.query(query, [req.session.user.id], cb); };
    }

    getConsumerId(function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (!consumerId) {
        if (result.rowCount === 0) {
          return res.status(404).end();
        }
        consumerId = result.rows[0].id;
      }

      // run stats upsert
      db.upsert(client,
        ['UPDATE "userLoyaltyStats"',
          'SET',
            '"numPunches"   = "numPunches"   + $3,',
            '"totalPunches" = "totalPunches" + $3',
          'WHERE "consumerId"=$1 AND "businessId"=$2'
        ].join(' '),
        [consumerId, businessId, deltaPunches],
        ['INSERT INTO "userLoyaltyStats"',
          '("consumerId", "businessId", "numPunches", "totalPunches", "visitCount", "lastVisit")',
          'SELECT $1, $2, $3, $3, 0, now() WHERE NOT EXISTS',
            '(SELECT 1 FROM "userLoyaltyStats" WHERE "consumerId"=$1 AND "businessId"=$2)'
        ].join(' '),
        [consumerId, businessId, deltaPunches],
        function(error, result) {
          if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
          logger.db.debug(TAGS, result);

          res.json({ error: null, data: null });

          magic.emit('loyalty.punch', deltaPunches, consumerId, businessId, req.body.locationId, req.session.user.id);
        }
      );
    });
  });
};
