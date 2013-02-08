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
, users           = db.tables.users
, tapinStations   = db.tables.tapinStations
, groups          = db.tables.groups
, usersGroups     = db.tables.usersGroups
;

exports.owner = function(req, cb) {
  if (!req.session || !req.session.user) return cb(null);

  var userId = req.param('id');

  db.getClient('tapinstations owner apply groups', function(error, client){
    if (error) return cb(null);

    var query = tapinStations.select(
      tapinStations.id
    ).where(
      tapinStations.userId.equals(req.session.user.id)
    ).toQuery();

    client.query(query, function(error, result){
      if (error) return cb(null);

      if (result.rows.length === 0) return cb(null);
      if (result.rows[0].id != userId) return cb(null);

      cb('owner');
    });
  });
};