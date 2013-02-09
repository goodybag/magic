
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

  if (!req.session.user)
    return res.error(errors.auth.NOT_AUTHENTICATED);

  db.getClient(TAGS[0], function(error, client){
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
        // This really shouldn't happen, but whatevs
        if (result.rowCount === 0) {
          return res.json({ error: null, data: req.param('businessId') ? null : [] });
        }
        consumerId = result.rows[0].id;
      }

      // get stats
      var query = sql.query('SELECT {fields} FROM "userLoyaltyStats" {busJoin} {loyaltyJoin} {where}');

      query.fields = sql.fields().add('"userLoyaltyStats".*');
      query.fields.add('businesses.name as "businessName"');
      query.fields.add('"businessLoyaltySettings".reward as reward');

      query.busJoin = 'join businesses on "userLoyaltyStats"."businessId" = businesses.id';
      query.loyaltyJoin = 'join "businessLoyaltySettings" on "userLoyaltyStats"."businessId" = "businessLoyaltySettings"."businessId"';

      query.where = sql.where().and('"userLoyaltyStats"."consumerId" = $consumerId');

      query.$('consumerId', consumerId);

      if (req.param('businessId')){
        query.where.and('"userLoyaltyStats"."businessId" = $businessId');
        query.$('businessId', req.param('businessId'));
      }

      client.query(query.toString(), query.$values, function(error, result){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
        logger.db.debug(TAGS, result);

        if (result.rows.length > 0)
          return res.json({ error: null, data: req.param('businessId') ? result.rows[0] : result.rows });
        if (!req.param('businessId'))
          return res.json({ error: null, data: [] });

        return res.json({ error: null, data: null });
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

  db.getClient(TAGS[0], function(error, client){
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

      // start a transaction
      var tx = new Transaction(client);
      tx.begin(function(error) {

        // update punches
        db.procedures.updateUserLoyaltyStats(client, tx, consumerId, businessId, deltaPunches, function(err, hasEarnedReward, numRewards, hasBecomeElite, dateBecameElite) {
          if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

          tx.commit();
          res.json({ error:null, data:null });

          magic.emit('loyalty.punch', deltaPunches, consumerId, businessId, req.body.locationId, req.session.user.id);
          if (hasBecomeElite)
            magic.emit('consumers.becameElite', consumerId, businessId, req.body.locationId);

          if (hasEarnedReward)
            magic.emit('loyalty.hasEarnedReward', deltaPunches, consumerId, businessId, req.body.locationId, req.session.user.id);
        });
      });
    });
  });
};
