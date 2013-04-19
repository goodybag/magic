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

  var tags = ['businesses-ownerManager', req.uuid];

  var query = sql.query('SELECT id FROM managers WHERE id = $id AND "businessId" = $businessId');
  query.$('id', userId);
  query.$('businessId', businessId);

  db.query(query, function(error, rows, result) {
    if (error || result.rowCount === 0) return cb(null);
    cb('ownerManager');
  });
};
