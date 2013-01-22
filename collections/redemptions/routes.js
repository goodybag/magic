
/*
 * Redemptions resources
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}

  // Tables
, redemptions = db.tables.redemptions
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
  logger.routes.debug(TAGS, 'fetching redemptions', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = utils.selectAsMap(redemptions, req.fields)
      .from(redemptions);
    utils.paginateQuery(req, query);

    // run data query
    client.query(query.toQuery(), function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      // run count query
      client.query('SELECT COUNT(*) as count FROM redemptions', function(error, countResult) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: dataResult.rows, meta: { total:countResult.rows[0].count } });
      });
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
      client.query(query, [req.body.tapinStationId], function(error, res) {
        if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error); }
        if (result.rowCount === 0) { return res.error(errors.internal.BAD_DATA, 'Business loyalty settings not found'), tx.abort(), logger.routes.error(TAGS, error); }
        var bls = results.rows[0];

        // check that the user has enough punches
        var query = [
          'SELECT {uls}.*, ({uls}."visitCount" >= $2) AS "isElite" FOR UPDATE OF {uls} FROM {uls}',
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
              ')'
        ] .join(' ')
          .replace(RegExp('{uls}','g'), '"userLoyaltyStats"');
        client.query(query, [req.body.consumerId, bls.eliteVisitsRequired, bls.elitePunchesRequired, bls.regularPunchesRequired], function(error, result) {
          if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error); }
          if (result.rowCount === 0) {
            return res.error(errors.business.NOT_ENOUGH_PUNCHES), tx.abort();
          }
          var uls = results.rows[0];

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
            var lessPunches = (uls.isElite) ? bls.elitePunchesRequired : uls.regularPunchesRequired;
            var query = [
              'UPDATE {uls} SET "numPunches"="numPunches"-$3',
                'WHERE "consumerId"=$1 AND "businessId"=$2'
            ] .join(' ')
              .replace(RegExp('{uls}','g'), '"userLoyaltyStats"');
            client.query(query, [req.body.consumerId, bls.businessId, lessPunches], function(error, result) {
              if (error) { return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error); }

              // success!
              tx.commit(function(error) {
                if (error) { return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error); }

                // send back the updated user stats
                uls.numPunches -= lessPunches;
                return res.json({ error:null, data:uls });
              });
            });
          });
        });
      });
    });
  });
};
