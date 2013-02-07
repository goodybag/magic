
/*
 * Redemptions resources
 */

var
  db      = require('../../db')
, sql     = require('../../lib/sql')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}

  // Tables
, schemas     = db.schemas
, Transaction = require('pg-transaction')
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

/**
 * List Redemptions
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-redemptions', req.uuid];
  logger.routes.debug(TAGS, 'fetching redemptions');

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('SELECT *, COUNT(id) OVER() AS "metaTotal" FROM "userRedemptions" {limit}');
    query.limit = sql.limit(req.query.limit, req.query.offset);

    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, dataResult);

      var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
      return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
    });
  });
};

/**
 * Create Redemption
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.create = function(req, res){
  var TAGS = ['create-redemptions', req.uuid];

  var deltaPunches = +req.body.deltaPunches || 0;
  var consumerId = req.body.consumerId;
  var tapinStationId = req.body.tapinStationId;
  var businessId = null, locationId = null;

  db.getClient(TAGS[0], function(error, client){
    if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

    // start transaction
    var tx = new Transaction(client);
    tx.begin(function(error) {
      if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error); }

      // get business
      client.query('SELECT "businessId", "locationId" FROM "tapinStations" WHERE id=$1', [tapinStationId], function(error, result) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);
        businessId = result.rows[0].businessId;
        locationId = result.rows[0].locationId;

        // update punches
        db.procedures.updateUserLoyaltyStats(client, tx, consumerId, businessId, deltaPunches, function(error, hasEarnedReward, numRewards, hasBecomeElite, dateBecameElite) {
          if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

          if (numRewards === 0) {
            return res.error(errors.business.NOT_ENOUGH_PUNCHES), tx.abort();
          }

          // create the redemption
          var query = [
            'INSERT INTO "userRedemptions"',
              '("businessId","locationId","consumerId","cashierUserId","tapinStationId","dateTime")',
              'VALUES ($1, $2, $3, $4, $5, now())'
          ] .join(' ');
          client.query(query, [businessId, locationId, consumerId, req.session.user.id, tapinStationId], function(error, result) {
            
            if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error); }

            // update user's loyalty stats
            var query = 'UPDATE "userLoyaltyStats" SET "numRewards" = "numRewards" - 1 WHERE "consumerId"=$1 AND "businessId"=$2';
            client.query(query, [consumerId, businessId], function(error, result) {
              if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error); }

              // success!
              tx.commit(function(error) {
                if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

                res.json({ error:null, data:null });

                magic.emit('loyalty.punch', deltaPunches, consumerId, businessId, req.body.locationId, req.session.user.id);
                if (hasBecomeElite)
                  magic.emit('consumers.becameElite', consumerId, businessId, dateBecameElite);
                // :TODO: emit on hasEarnedReward?
                magic.emit('loyalty.redemption', deltaPunches, consumerId, businessId, locationId, req.session.user.id);
              });
            });
          });
        });
      });
    });
  });
};
