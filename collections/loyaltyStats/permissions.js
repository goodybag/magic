/**
 * Loyalty Stats permissions
 */

var 
  db  = require('../../db')
, sql = require('../../lib/sql')
;

exports.employee = function(req, cb) {
  if (!req.session.user) return cb(null);
  
  var consumerId = req.body.consumerId;
  var businessId = req.body.businessId;
  var userId     = req.session.user.id;

  db.getClient(function(error, client) {
    if (error) cb(null);

    // were we given a consumer id in the request body?
    var query;
    if (req.session.user.groups.indexOf('manager') !== -1) {
      query = sql.query('SELECT id FROM managers WHERE "userId" = $userId AND "businessId" = $businessId');
    } else if (req.session.user.groups.indexOf('cashier') !== -1) {
      query = sql.query('SELECT id FROM cashiers WHERE "userId" = $userId AND "businessId" = $businessId');
    } else {
      return cb(null);
    }
    query.$('userId', userId);
    query.$('businessId', businessId);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error || result.rowCount === 0) return cb(null);
      cb('employee');
    });
  });
};