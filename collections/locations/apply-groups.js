/**
 * Manager permissions
 */

var
  db      = require('../../db')
, sql = require('../../lib/sql')
;

exports.manager = function(req, cb) {
  if (!req.session.user) return cb(null);
  if (req.session.user.groups.indexOf('manager') !== -1) return cb(null);

  var locationId = req.param('locationId');
  var userId     = req.session.user.id;


  db.getClient('location manager apply groups', function(error, client) {
    if (error) cb(null);

    var query = sql.query('SELECT id FROM managers WHERE "userId" = $userId AND "locationId" = $locationId');
    query.$('userId', userId);
    query.$('locationId', locationId);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error || result.rowCount === 0) return cb(null);
      cb('manager');
    });
  });
};