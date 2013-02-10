/**
 * Loyalty Stats permissions
 */

var
  db  = require('../../db')
, sql = require('../../lib/sql')
;

exports.employee = function(req, cb) {
  if (!req.session.user) return cb(null);
  if (req.session.user.groups.indexOf('manager') === -1 &&
      req.session.user.groups.indexOf('cashier') === -1)
    return cb(null);

  var consumerId = req.param('consumerId');
  var businessId = req.param('businessId');
  var loyaltyId  = req.param('loyaltyId');
  var userId     = req.session.user.id;
  
  db.getClient('loyaltyStats employee apply groups', function(error, client) {
    if (error) cb(null);

    // were we given a consumer id in the request body?
    var query;
    if (req.session.user.groups.indexOf('manager') !== -1) {
      if (req.param('loyaltyId'))
        query = sql.query('select * from managers, "userLoyaltyStats" where managers."userId" = $userId and managers."businessId" = "userLoyaltyStats"."businessId" and "userLoyaltyStats".id = $loyaltyId');
      else
        query = sql.query('SELECT id FROM managers WHERE "userId" = $userId AND "businessId" = $businessId');
    } else if (req.session.user.groups.indexOf('cashier') !== -1) {
      if (req.param('loyaltyId'))
        query = sql.query('select * from cashiers, "userLoyaltyStats" where cashiers."userId" = $userId and cashiers."businessId" = "userLoyaltyStats"."businessId" and "userLoyaltyStats".id = $loyaltyId');
      else
        query = sql.query('SELECT id FROM cashiers WHERE "userId" = $userId AND "businessId" = $businessId');
    }
    query.$('userId', userId);
    if (businessId) query.$('businessId', businessId);
    if (loyaltyId) query.$('loyaltyId', loyaltyId);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error || result.rowCount === 0) return cb(null);
      cb('employee');
    });
  });
};