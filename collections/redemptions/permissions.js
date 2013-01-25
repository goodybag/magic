/**
 * Redemptions permissions
 */

var 
  db      = require('../../db')
;

exports.locationEmployee = function(req, cb) {
  if (!req.session.user) return cb(null);
  
  var tapinStationId = +req.body.tapinStationId;
  var cashierUserId  = +req.session.user.id;
  var cashierTable = '"cashiers"';
  if (req.session.user.groups.indexOf('manager') !== -1) { cashierTable = '"managers"'; }

  // validate that the employee belongs to the same location as the tapin station
  db.getClient(function(error, client) {
    if (error) return cb(null);

    var query = [
      'SELECT "tapinStations".id FROM "tapinStations"',
        'INNER JOIN {c} ON',
          '{c}."userId" = $2 AND',
          '{c}."locationId" = "tapinStations"."locationId"',
        'WHERE "tapinStations".id = $1'
    ] .join(' ')
      .replace(RegExp('{c}','g'), cashierTable)
    client.query(query, [tapinStationId, cashierUserId], function(error, result) {
      if (error) return cb(null);
      if (result.rowCount === 0) { cb(null); }
      else { cb('locationEmployee'); }
    });
  });
};