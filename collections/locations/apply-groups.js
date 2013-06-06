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

exports.locationManager = function(req, cb) {
  if (!req.session.user) return cb(null);

  if (req.session.user.groups && req.session.user.groups.indexOf('manager') == -1) return cb(null);
  var locationId = req.param('locationId');
  var userId     = req.session.user.id;

  var query = sql.query('SELECT id FROM managers WHERE id = $userId AND "locationId" = $locationId');
  query.$('userId', userId);
  query.$('locationId', locationId);

  db.query(query, function(error, rows, result) {
    if (error || result.rowCount === 0) return cb(null);

    cb('location-manager');
  });
};