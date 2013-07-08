
/*
 * Redemptions resources
 */

var
  db      = require('../../db')
, sql     = require('../../lib/sql')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, magic   = require('../../lib/magic')

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

  var query = sql.query('SELECT *, COUNT(id) OVER() AS "metaTotal" FROM "userRedemptions" {limit}');
  query.limit = sql.limit(req.query.limit, req.query.offset);

  db.query(query, function(error, rows, dataResult){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
    var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
    return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
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
  var userId = req.body.userId;
  var tapinStationId = req.body.tapinStationId;
  var businessId = null, locationId = null;

  db.getClient(TAGS, function(error, client, done){
    if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

    // Ensure user is registered
    var query = 'select * from users WHERE id = $1';
    client.query(query, [userId], function(error, result){
      if (error) { 
        done();
        return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); 
      }

      if (result.rows.length === 0) {
        done();
        return res.error(errors.input.INVALID_USERS), logger.routes.error(TAGS, errors.input.INVALID_USERS);
      }

      if (!result.rows[0].email && !(result.rows[0].singlyAccessToken && result.rows[0].singlyId)) {
        done();
        return res.error(errors.registration.NOT_REGISTERED), logger.routes.error(TAGS, errors.registration.NOT_REGISTERED);
      }

      // start transaction
      var tx = new Transaction(client);
      tx.begin(function(error) {
        if (error) { 
          //destroy the client
          done(error);
          logger.routes.error(TAGS, error); 
          return res.error(errors.internal.DB_FAILURE, error); 
        }

        // get business
        client.query('SELECT "businessId", "locationId" FROM "tapinStations" WHERE id=$1', [tapinStationId], function(error, result) {
          if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(done), logger.routes.error(TAGS, error);
          businessId = result.rows[0].businessId;
          locationId = result.rows[0].locationId;

          // update punches
          db.procedures.setLogTags(TAGS);
          db.procedures.updateUserLoyaltyStats(client, tx, userId, businessId, deltaPunches, function(error, hasEarnedReward, numRewards, hasBecomeElite, dateBecameElite) {
            if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(done), logger.routes.error(TAGS, error);

            if (numRewards === 0) {
              return res.error(errors.business.NOT_ENOUGH_PUNCHES), tx.abort(done);
            }

            // create the redemption
            var query = [
              'INSERT INTO "userRedemptions"',
                '("businessId","locationId","userId","cashierUserId","tapinStationId","dateTime")',
                'VALUES ($1, $2, $3, $4, $5, now())'
            ] .join(' ');
            client.query(query, [businessId, locationId, userId, req.session.user.id, tapinStationId], function(error, result) {

              if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(done), logger.routes.error(TAGS, error); }

              // update user's loyalty stats
              var query = 'UPDATE "userLoyaltyStats" SET "numRewards" = "numRewards" - 1 WHERE "userId"=$1 AND "businessId"=$2';
              client.query(query, [userId, businessId], function(error, result) {
                if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(done), logger.routes.error(TAGS, error); }

                // success!
                tx.commit(function(error) {
                  //destroy client on commit error
                  done(error);
                  if (error) { 
                    return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); 
                  }

                  res.noContent();

                  magic.emit('loyalty.punch', deltaPunches, userId, businessId, locationId, req.session.user.id);

                  if (hasBecomeElite)
                    magic.emit('consumers.becameElite', userId, businessId, locationId);

                  magic.emit('loyalty.redemption', deltaPunches, userId, businessId, locationId, req.session.user.id);

                  if (hasEarnedReward)
                    magic.emit('loyalty.hasEarnedReward', deltaPunches, userId, businessId, locationId, req.session.user.id);
                });
              });
            });
          });
        });
      });
    });
  });
};
