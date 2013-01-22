/**
 * Loyalty Stats permissions
 */

var 
  db      = require('../../db')
, userLoyaltyStats = db.tables.userLoyaltyStats
, consumers        = db.tables.consumers
;

exports.owner = function(req, cb) {
  if (!req.session.user) return cb(null);
  
  var consumerId = req.body.consumerId;
  var businessId = req.body.businessId;
  var userId     = req.session.user.id;

  db.getClient(function(error, client) {
    if (error) cb(null);

    // were we given a consumer id in the request body?
    var query, qv = [userId];
    if (consumerId) {
      // make sure it belongs to the authorized user
      query = 'SELECT id FROM consumers WHERE "userId" = $1 AND id = $2';
      qv.push(consumerId);
    } else {
      // make sure the authorized user is a consumer
      query = 'SELECT id FROM consumers WHERE "userId" = $1';
    }

    client.query(query, qv, function(error, result) {
      if (error || result.rowCount === 0) return cb(null);
      cb('owner')
    });
  });
};