/**
 * Manager permissions
 */

var
  db      = require('../../db')
, sql = require('../../lib/sql')
;

exports.manager = function(req, cb) {
  if (!req.session.user) return cb(null);
  if (req.session.user.groups && req.session.user.groups.indexOf('manager') !== -1) return cb(null);

  var locationId = req.param('locationId');
  var userId     = req.session.user.id;

  var query = sql.query('SELECT id FROM managers WHERE id = $userId AND "locationId" = $locationId');
  query.$('userId', userId);
  query.$('locationId', locationId);

  db.query(query, function(error, rows, result) {
    if (error || result.rowCount === 0) return cb(null);
    cb('manager');
  });
};

//applies group 'ownerManager' to this request
//if the user is the manager of any location of this business
exports.ownerManager = function(req, cb) {
  if (!req.session.user) return cb(null);

  var query = sql.query([
    'SELECT managers.id',
    'FROM locations ',
    'JOIN businesses ON locations."businessId" = businesses.id',
    'JOIN managers ON businesses.id = managers."businessId"',
    'WHERE managers.id = $userId AND locations.id = $locationId',
  ''].join(' '))
  
  var locationId = req.param('locationId');
  var userId     = req.session.user.id;

  query.$('userId', userId);
  query.$('locationId', locationId);
  db.query(query, function(error, rows) {
    if(error || !rows.length) {
      return cb(null);
    }
    return cb('ownerManager');
  });
};
