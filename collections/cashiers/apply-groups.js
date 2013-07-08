/**
 * Owner permissions
 */

var
  singly  = require('singly')

, db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config  = require('../../config')

  // Tables
, users       = db.tables.users
, cashiers    = db.tables.cashiers
, groups      = db.tables.groups
, usersGroups = db.tables.usersGroups
;

exports.owner = function(req, cb) {
  if (!req.session || !req.session.user) return cb(null);

  var userId = req.param('id');

  var TAGS = ['cashiers-owner-apply-groups', req.uuid];

  var query = cashiers.select(
    cashiers.id
  ).where(
  cashiers.id.equals(req.session.user.id)
  );

  db.query(query, function(error, rows, result){
    if (error) return cb(null);

    if (rows.length === 0) return cb(null);
    if (rows[0].id != userId) return cb(null);

    cb('owner');
  });
};
