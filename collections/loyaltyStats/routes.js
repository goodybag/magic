
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
 * Get singly Loyalty Stat record
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 * :NOTE: req.body.consumerId will be correctly filled by the permissions middleware
 *        (if it's not, the route will be stopped due to lack of credentials)
 */
module.exports.getOne = function(req, res){
  var TAGS = ['get-loyaltystats', req.uuid];
  logger.routes.debug(TAGS, 'fetching loyaltystats');

  if (!req.session.user)
    return res.error(errors.auth.NOT_AUTHENTICATED);
  db.api.userLoyaltyStats.findOne(req.param('loyaltyId'), function(error, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    res.json({ error: null, data: result });
  });
};

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
    var consumerId = req.param('consumerId');
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
      var query = sql.query('SELECT {fields} FROM "userLoyaltyStats" {busJoin} {loyaltyJoin} {userJoin} {where}');

      query.fields = sql.fields().add('"userLoyaltyStats".*');
      query.fields.add('businesses.name AS "businessName"');
      query.fields.add('"businessLoyaltySettings".reward AS reward');
      query.fields.add('"businessLoyaltySettings"."photoUrl" AS "photoUrl"');
      query.fields.add('(users.email IS NOT NULL OR users."singlyAccessToken" IS NOT NULL) AS "isRegistered"');

      query.busJoin = 'JOIN businesses ON "userLoyaltyStats"."businessId" = businesses.id';
      query.loyaltyJoin = 'JOIN "businessLoyaltySettings" ON "userLoyaltyStats"."businessId" = "businessLoyaltySettings"."businessId"';
      query.userJoin = 'JOIN consumers ON consumers.id = "userLoyaltyStats"."consumerId" JOIN users ON users.id = consumers."userId"';

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

        // They've requested either a loyaltystat that hasn't been created yet
        // Or a business that doesn't exist
        // Or a business that hasn't setup their loyalty program
        // First, check the two latter
        query = [
          'select businesses.id from businesses'
        ,   'join "businessLoyaltySettings"'
        ,     'on businesses.id = "businessLoyaltySettings"."businessId"'
        , 'where businesses.id = $1'
        ].join(' ');

        client.query(query, [req.param('businessId')], function(error, result){
          if (error)
            return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

          if (result.rows.length === 0)
            return res.error(errors.input.NOT_FOUND), logger.routes.error(TAGS, errors.input.NOT_FOUND);

          // Ok, the business and business loyalty setting both existed
          // Create a default version of the record they're requesting
          var stat = {
            consumerId:       consumerId
          , businessId:       req.param('businessId')
          , numPunches:       0
          , totalPunches:     0
          , numRewards:       0

            // If this is a tapin-auth, we know this is actually a visit
            // Not TOTALLY accurate but mostly and will get updated eventually
          , visitCount:       req.header('authorization').indexOf('Tapin') > -1 ? 1 : 0

          , lastVisit:        'now()'
          , isElite:          false
          , dateBecameElite:  null
          };

          utils.parallel({
            stats: function(done){
              db.api.userLoyaltyStats.insert(stat, done);
            }

          , settings: function(done){
              db.api.businessLoyaltySettings.findOne({ businessId: stat.businessId }, function(e, r){
                done(e, r); // find passes back 3 params, which messes with the parallel fn results
              });
            }
          }, function(error, results){
            if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

            stat.id = results.stats.id;
            stat.lastVisit = new Date();
            stat.reward = results.settings.reward;
            stat.photoUrl = results.settings.photoUrl;

            res.json({ error: null, data: stat });
          });
        });
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
    var consumerId = req.param('consumerId');
    var businessId = req.param('businessId');

    // ensure we have a consumer id
    var getConsumerId = function(cb) { cb(); };
    if (!consumerId && !req.param('loyaltyId')) {
      // no consumerId given, look it up off the authed user
      var query = 'SELECT id FROM consumers WHERE "userId" = $1';
      getConsumerId = function(cb) { client.query(query, [req.session.user.id], cb); };
    }

    getConsumerId(function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (!consumerId && !req.param('loyaltyId')) {
        if (result.rowCount === 0) {
          return res.status(404).end();
        }
        consumerId = result.rows[0].id;
      }

      // start a transaction
      var tx = new Transaction(client);
      tx.begin(function(error) {

        var args = [client, tx], updateFn;
        if (req.param('loyaltyId')){
          args.push(req.param('loyaltyId'));
          updateFn = db.procedures.updateUserLoyaltyStatsById;
        } else {
          args.push(consumerId, businessId);
          updateFn = db.procedures.updateUserLoyaltyStats;
        }

        args.push(deltaPunches, function(err, hasEarnedReward, numRewards, hasBecomeElite, dateBecameElite) {
          if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

          tx.commit();
          res.json({ error:null, data:null });

          magic.emit('loyalty.punch', deltaPunches, consumerId, businessId, req.body.locationId, req.session.user.id);
          if (hasBecomeElite)
            magic.emit('consumers.becameElite', consumerId, businessId, req.body.locationId);

          if (hasEarnedReward)
            magic.emit('loyalty.hasEarnedReward', deltaPunches, consumerId, businessId, req.body.locationId, req.session.user.id);
        });

        // update punches
        updateFn.apply({}, args);
      });
    });
  });
};
