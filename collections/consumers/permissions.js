/**
 * Owner permissions
 */

var
  db      = require('../../db')

  // Tables
, consumers   = db.tables.consumers
;

exports.owner = function(req, cb) {
  if (!req.session || !req.session.user) return cb(null);

  var userId = req.param('id');

  db.getClient(function(error, client){
    if (error) return cb(null);

    var query = consumers.select(
      consumers.id
    ).where(
      consumers.userId.equals(req.session.user.id)
    ).toQuery();

    client.query(query, function(error, result){
      if (error) return cb(null);

      if (result.rows.length === 0) return cb(null);
      if (result.rows[0].id != userId) return cb(null);

      cb('owner');
    });
  });
};