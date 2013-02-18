/**
 * Business permissions
 */

var
  db  = require('../../db')
, sql = require('../../lib/sql')
;

exports.ownerManager = function(req, cb) {
  if (!req.session.user) return cb(null);
  if (req.session.user.groups.indexOf('manager') === -1) return cb(null);

  var businessId = req.param('id');
  var userId     = req.session.user.id;

  db.getClient('businesses ownerManager', function(error, client) {
    if (error) cb(null);

    var query = sql.query('SELECT "userId" FROM managers WHERE "userId" = $userId AND "businessId" = $businessId');
    query.$('userId', userId);
    query.$('businessId', businessId);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error || result.rowCount === 0) return cb(null);
      cb('ownerManager');
    });
  });
};