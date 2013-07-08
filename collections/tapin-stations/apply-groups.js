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
, users           = db.tables.users
, tapinStations   = db.tables.tapinStations
, groups          = db.tables.groups
, usersGroups     = db.tables.usersGroups
;

exports.owner = function(req, cb) {
  if (!req.session || !req.session.user) return cb(null);

  var userId = req.param('id');
  if (userId != req.session.user.id) return cb(null);  
  cb('owner')
};
