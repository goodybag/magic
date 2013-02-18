/**
 * Redemptions permissions
 */

var
  db      = require('../../db')
;

exports.locationEmployee = function(req, cb) {
  if (!req.session.user) return cb(null);

  var tapinStationId = +req.body.tapinStationId;
  var authedUserId  = +req.session.user.id;
  var authedUserTable = '"cashiers"';
  if (req.session.user.groups.indexOf('manager') !== -1) { authedUserTable = '"managers"'; }

  // validate that the employee belongs to the same location as the tapin station
  db.getClient('redemptions locationEmployee apply groups', function(error, client) {
    if (error) return cb(null), console.log('DB ERROR from redemptions/apply-groups:', error);

    var query = [
      'SELECT "tapinStations"."userId" FROM "tapinStations"',
        'INNER JOIN {c} ON',
          '{c}."userId" = $2 AND',
          '{c}."locationId" = "tapinStations"."locationId"',
        'WHERE "tapinStations"."userId" = $1'
    ] .join(' ')
      .replace(RegExp('{c}','g'), authedUserTable)

    client.query(query, [tapinStationId, authedUserId], function(error, result) {
      if (error) return cb(null), console.log('DB ERROR from redemptions/apply-groups:', error);
      if (result.rowCount === 0) { cb(null); }
      else { cb('locationEmployee'); }
    });
  });
};