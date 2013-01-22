/**
 * Redemptions permissions
 */

var 
  db      = require('../../db')
;

exports.cashier = function(req, cb) {
  if (!req.session.user) return cb(null);
  
  var tapinStationId = req.body.tapinStationId;
  var cashierUserId  = req.session.user.id;
  var cashierTable = '"cashiers"';
  if (req.session.user.group.indexOf('manager') !== -1) { cashierTable = '"managers"'; }

  // validate that the cashier belongs to the same location as the tapin station
  db.getClient(function(error, client) {
    if (error) return res.error(errors.internal.DB_FAILURE, error);

    var query = [
      'SELECT "tapinStations".id FROM "tapinStations"',
        'INNER JOIN', cashierTable, 'ON',
          cashierTable,'."userId" = $2 AND',
          cashierTable,'."locationId" = "tapinStations"."locationId"',
        'WHERE "tapinStations".id = $1'
    ].join(' ');
    client.query(query, [tapinStationId, cashierUserID], function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error);

      if (result.rowCount === 0) { cb(null); }
      else { cb('cashier'); }
    });
  });
};