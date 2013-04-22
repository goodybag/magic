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

  var businessId = req.param('businessId');
  var loyaltyId  = req.param('loyaltyId');
  var userId     = req.session.user.id;

  // were we given a consumer id in the request body?
  var query;
  if (req.session.user.groups.indexOf('manager') !== -1) {
    if (req.param('loyaltyId'))
      query = sql.query('select managers.id from managers, "userLoyaltyStats" where managers.id = $userId and managers."businessId" = "userLoyaltyStats"."businessId" and "userLoyaltyStats".id = $loyaltyId');
    else
      query = sql.query('SELECT id FROM managers WHERE id = $userId AND "businessId" = $businessId');
  } else if (req.session.user.groups.indexOf('cashier') !== -1) {
    if (req.param('loyaltyId'))
      query = sql.query('select cashiers.id from cashiers, "userLoyaltyStats" where cashiers.id = $userId and cashiers."businessId" = "userLoyaltyStats"."businessId" and "userLoyaltyStats".id = $loyaltyId');
    else
      query = sql.query('SELECT id FROM cashiers WHERE id = $userId AND "businessId" = $businessId');
  }
  query.$('userId', userId);
  if (businessId) query.$('businessId', businessId);
  if (loyaltyId) query.$('loyaltyId', loyaltyId);

  db.query(query, function(error, rows, result) {
    if (error || result.rowCount === 0) return cb(null);
    cb('employee');
  });
};
