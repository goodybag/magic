
/*
 * Loyalty Stats resources
 */

var
  db          = require('../../db')
, sql         = require('../../lib/sql')
, utils       = require('../../lib/utils')
, errors      = require('../../lib/errors')
, Transaction = require('pg-transaction')

, logger  = {}

, schemas          = db.schemas
, magic       = require('../../lib/magic')
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

/**
 * Get singly Loyalty Stat record
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-loyaltystats', req.uuid];
  logger.routes.debug(TAGS, 'fetching loyaltystats');

  if (!req.session.user)
    return res.error(errors.auth.NOT_AUTHENTICATED);
  db.api.userLoyaltyStats.setLogTags(TAGS);
  db.api.userLoyaltyStats.findOne(req.param('loyaltyId'), function(error, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    res.json({ error: null, data: result });
  });
};

/**
 * Get Loyalty Stats
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['get-loyaltystats', req.uuid];
  logger.routes.debug(TAGS, 'fetching loyaltystats');

  if (!req.session.user)
    return res.error(errors.auth.NOT_AUTHENTICATED);

  // get stats
  var query = sql.query('SELECT {fields} FROM "userLoyaltyStats" {busJoin} {loyaltyJoin} {userJoin} {where} {limit}');
  query.limit = sql.limit(req.query.limit, req.query.offset);

  query.fields = sql.fields().add('"userLoyaltyStats".*');
  query.fields.add('businesses.name AS "businessName"');
  query.fields.add('"businessLoyaltySettings".reward AS reward');
  query.fields.add('"businessLoyaltySettings"."photoUrl" AS "photoUrl"');
  query.fields.add('"businessLoyaltySettings"."punchesRequiredToBecomeElite" AS "punchesRequiredToBecomeElite"');
  query.fields.add('"businessLoyaltySettings"."elitePunchesRequired" AS "elitePunchesRequired"');
  query.fields.add('"businessLoyaltySettings"."regularPunchesRequired" AS "regularPunchesRequired"');
  query.fields.add('"businessLoyaltySettings"."requiredItem" AS "requiredItem"');
  query.fields.add('"businesses"."logoUrl" AS "businessLogo"');
  query.fields.add('(users.email IS NOT NULL OR users."singlyAccessToken" IS NOT NULL) AS "isRegistered"');

  query.busJoin = 'JOIN businesses ON "userLoyaltyStats"."businessId" = businesses.id';
  query.loyaltyJoin = 'JOIN "businessLoyaltySettings" ON "userLoyaltyStats"."businessId" = "businessLoyaltySettings"."businessId"';
  query.userJoin = 'JOIN users ON users.id = "userLoyaltyStats"."userId"';

  query.where = sql.where().and('"userLoyaltyStats"."userId" = $userId');

  query.$('userId', req.param('userId') || req.session.user.id);

  if (req.param('businessId')){
    query.where.and('"userLoyaltyStats"."businessId" = $businessId');
    query.$('businessId', req.param('businessId'));
  } else
    query.where.and('"userLoyaltyStats"."totalPunches" > 0');

  query.fields.add('COUNT(*) OVER() as "metaTotal"');

  db.query(query, function(error, rows, result){

    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var total = (result.rows[0]) ? result.rows[0].metaTotal : 0;

    if (result.rows.length > 0){
      return res.json({
        error: null
      , data: req.param('businessId') ? result.rows[0] : result.rows
      , meta: { total:total }
      });
    } else if (!req.param('businessId')){
      return res.json({ error: null , data: [] , meta: { total: 0 } });
    }

    // They've requested either a loyaltystat that hasn't been created yet
    // Or a business that doesn't exist
    // Or a business that hasn't setup their loyalty program
    // First, check the two latter
    query = [
      'select b.name, b."logoUrl", s.*'
    ,    'from businesses b join "businessLoyaltySettings" s'
    ,    'on (b.id = s."businessId")'
    ,    'where b.id = $1'
    ].join(' ');

    db.query(query, [req.param('businessId')], function(error, rows, result){
      if (error)
        return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (result.rows.length === 0)
        return res.error(errors.input.NOT_FOUND), logger.routes.error(TAGS, errors.input.NOT_FOUND);

      // Ok, the business and business loyalty setting both existed
      // Create a default version of the record they're requesting
      var stat = {
        userId:           req.session.user.id
      , businessId:       req.param('businessId')
      , numPunches:       0
      , totalPunches:     0
      , numRewards:       0

        // If this is a tapin-auth, we know this is actually a visit
        // Not TOTALLY accurate but mostly and will get updated eventually
      , visitCount:       (req.header('authorization') && req.header('authorization').indexOf('Tapin') > -1) ? 1 : 0

      , lastVisit:        'now()'
      , isElite:          false
      , dateBecameElite:  null
      };

      var business = {
        businessName: result.rows[0].name
      , businessLogo: result.rows[0].logoUrl
      }

      utils.parallel({
        stats: function(done){
          db.api.userLoyaltyStats.setLogTags(TAGS);
          db.api.userLoyaltyStats.insert(stat, done);
        }

      , settings: function(done){
          db.api.businessLoyaltySettings.setLogTags(TAGS);
          db.api.businessLoyaltySettings.findOne({ businessId: stat.businessId }, function(e, r){
            done(e, r); // find passes back 3 params, which messes with the parallel fn results
          });
        }
      }, function(error, results){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        utils.extend(stat, {
          id: results.stats.id
        , lastVisit: new Date()
        , reward: results.settings.reward
        , requiredItem: results.settings.requiredItem
        , photoUrl: results.settings.photoUrl
        , regularPunchesRequired: results.settings.regularPunchesRequired
        , elitePunchesRequired: results.settings.elitePunchesRequired
        , punchesRequiredToBecomeElite: results.settings.punchesRequiredToBecomeElite
        }, business);

        res.json({ error: null, data: stat, meta: { total:1 } });
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

  db.getClient(TAGS, function(error, client, done){
    if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

    var deltaPunches = req.body.deltaPunches;
    var userId = req.param('userId');
    var businessId = req.param('businessId');

    // start a transaction
    var tx = new Transaction(client);
    tx.begin(function(error) {
      if(error) {
        //destroy the client if begin fails
        done(error);
        return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      }
      var args = [client, tx], updateFn;
      if (req.param('loyaltyId')){
        args.push(req.param('loyaltyId'));
        updateFn = db.procedures.updateUserLoyaltyStatsById;
      } else {
        args.push(userId, businessId);
        updateFn = db.procedures.updateUserLoyaltyStats;
      }

      args.push(deltaPunches, function(err, hasEarnedReward, numRewards, hasBecomeElite, dateBecameElite) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

        tx.commit(function(error) {
          if(error) {
            //destroy client if it failed to commit
            done(error);
            return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
          }
          done();
          res.noContent();
        });

        magic.emit('loyalty.punch', deltaPunches, userId, businessId, req.body.locationId, req.session.user.id);
        if (hasBecomeElite)
          magic.emit('consumers.becameElite', userId, businessId, req.body.locationId);

        if (hasEarnedReward)
          magic.emit('loyalty.hasEarnedReward', deltaPunches, userId, businessId, req.body.locationId, req.session.user.id);
      });

      // update punches
      db.procedures.setLogTags(TAGS);
      updateFn.apply({}, args);
    });
  });
};
