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
, managers    = db.tables.managers
, groups      = db.tables.groups
, usersGroups = db.tables.usersGroups
;

exports.owner = function(req, cb) {
  if (!req.session || !req.session.user) return cb(null);

  var userId = parseInt(req.param('id'));
  return cb(userId === req.session.user.id ? 'owner' : null);
};
