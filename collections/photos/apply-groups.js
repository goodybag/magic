/**
 * Owner permissions
 */

var
  db  = require('../../db')
, sql = require('../../lib/sql')
;

exports.owner = function(req, cb) {
  if (!req.session || !req.session.user) return cb(null);
  if (req.session.user.groups.indexOf('consumer') === -1) return cb(null);

  var userId = req.session.user.id;
  var TAGS = ['photo-owner-apply-groups', req.uuid];

  var query = sql.query([
    'SELECT 1 FROM photos',
      'WHERE photos.id = $photoId AND photos."userId" = $userId'
  ]);
  query.$('photoId', req.param('photoId'));
  query.$('userId', userId);
  db.query(query, function(err, rows, results) {
    if (err || results.rowCount === 0) return cb(null);
    cb('owner');
  });
};

exports.businessOwner = function(req, cb) {
  if (!req.session || !req.session.user) return cb(null);

  var isManager = (req.session.user.groups.indexOf('manager') !== -1);
  if (!isManager && req.session.user.groups.indexOf('cashier') === -1) return cb(null);

  var userId = req.session.user.id;
  var TAGS = ['photo-businessOwner-apply-groups', req.uuid];

  var query = sql.query([
    'SELECT 1, {userTable}."businessId" FROM photos',
      'INNER JOIN {userTable} ON',
        '{userTable}."businessId" = photos."businessId" AND',
        '{userTable}.id = $userId',
      'WHERE photos.id = $photoId'
  ]);
  query.userTable = (isManager) ? 'managers' : 'cashiers';
  query.$('photoId', req.param('photoId'));
  query.$('userId', userId);
  db.query(query, function(err, rows, results) {
    if (err || results.rowCount === 0) return cb(null);
    cb('businessOwner');
  });
};
