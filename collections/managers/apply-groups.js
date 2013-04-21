/**
 * Owner permissions
 */

var
  singly  = require('singly')

  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config  = require('../../config')

  // Tables
, users       = db.tables.users
, managers    = db.tables.managers
, groups      = db.tables.groups
, usersGroups = db.tables.usersGroups
;

exports.owner = function(req, cb) {
  if (!req.session || !req.session.user) return cb(null);

  var userId = req.param('id');

  var query = managers.select(
    managers.id
  ).where(
    managers.id.equals(req.session.user.id)
  ).toQuery();

  db.query(query, function(error, rows, result){
    if (error) return cb(null);

    if (result.rows.length === 0) return cb(null);
    if (result.rows[0].id != userId) return cb(null);

    cb('owner');
  });
};
