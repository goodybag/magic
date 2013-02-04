
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

  db.getClient(function(error, client){
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

  db.getClient(function(error, client){
    if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

    // start a transaction
    var tx = new Transaction(client);
    tx.begin(function(error) {
      if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error); }

      // get the business' loyalty settings
      var query = [
        'SELECT {bls}.* FROM {bls}',
          'INNER JOIN {ts} ON {ts}.id = $1 AND {ts}."businessId" = {bls}."businessId"'
      ] .join(' ')
        .replace(RegExp('{bls}','g'), '"businessLoyaltySettings"')
        .replace(RegExp('{ts}','g'), '"tapinStations"');

      client.query(query, [req.body.tapinStationId], function(error, result) {
        if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error); }
        if (result.rowCount === 0) { return res.error(errors.internal.BAD_DATA, 'Business loyalty settings not found'), tx.abort(), logger.routes.error(TAGS, error); }
        var bls = result.rows[0];

        // correct for the punches which are about to be added
        var elitePunchesReq = bls.elitePunchesRequired - deltaPunches;
        var regularPunchesReq = bls.regularPunchesRequired - deltaPunches;

        // check that the user has enough punches
        var query = [
          'SELECT {uls}.*, ({uls}."visitCount" >= $2) AS "isElite" FROM {uls}',
            'WHERE',
              '{uls}."consumerId" = $1',
              'AND (',
                '(',
                  '{uls}."visitCount"     >= $2',//$2=eliteVisitsRequired
                  'AND {uls}."numPunches" >= $3',//$3=elitePunchesRequired
                ') OR (',
                  '{uls}."visitCount"     <  $2',//$2=eliteVisitsRequired
                  'AND {uls}."numPunches" >= $4',//$4=regularPunchesRequired
                ')',
              ')',
            'FOR UPDATE OF {uls}'
        ] .join(' ')
          .replace(RegExp('{uls}','g'), '"userLoyaltyStats"');
        client.query(query, [req.body.consumerId, bls.eliteVisitsRequired, elitePunchesReq, regularPunchesReq], function(error, result) {
          if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error); }
          if (result.rowCount === 0) {
            return res.error(errors.business.NOT_ENOUGH_PUNCHES), tx.abort();
          }
          var uls = result.rows[0];

          // create the redemption
          var query = [
            'INSERT INTO {ur} ("businessId","consumerId","cashierUserId","locationId","tapinStationId","dateTime")',
              'SELECT {ts}."businessId", $1, $2, {ts}."locationId", $3, now() FROM {ts} WHERE {ts}.id = $3'
          ] .join(' ')
            .replace(RegExp('{ur}','g'), '"userRedemptions"')
            .replace(RegExp('{ts}','g'), '"tapinStations"');
          client.query(query, [req.body.consumerId, req.session.user.id, req.body.tapinStationId], function(error, result) {
            if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error); }

            // update user's loyalty stats
            var lessPunches = (uls.isElite) ? bls.elitePunchesRequired : bls.regularPunchesRequired;
            var query = [
              'UPDATE {uls}',
                'SET "numPunches"="numPunches" - $3 + $4,',
                  '"totalPunches"="totalPunches" + $4',
                'WHERE "consumerId"=$1 AND "businessId"=$2'
            ] .join(' ')
              .replace(RegExp('{uls}','g'), '"userLoyaltyStats"');
            client.query(query, [req.body.consumerId, bls.businessId, lessPunches, deltaPunches], function(error, result) {
              if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error); }

              // success!
              tx.commit(function(error) {
                if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

                // send back the updated user stats
                uls.numPunches = uls.numPunches + deltaPunches - lessPunches;
                uls.totalPunches += deltaPunches;
                return res.json({ error:null, data:uls });
              });
            });
          });
        });
      });
    });
  });
};
