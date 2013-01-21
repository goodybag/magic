/**
 * Loyalty Stats permissions
 */

var 
  db      = require('../../db')
, userLoyaltyStats = db.tables.userLoyaltyStats
, consumers        = db.tables.consumers
;

/** Logic Notes: **
 * Who is the target consumer?
 * - if the body includes `consumerId`, that's the target consumer
 * - otherwise, the authorized user is the target consumer
 */
exports.owner = function(req, cb) {
  if (!req.session.user) return cb(null);
  
  var consumerId = req.body.consumerId;
  var userId     = req.session.user.id;
  // console.log({userId:userId, consumerId:consumerId});

  // get the user's consumer data
  db.getClient(function(error, client) {
    if (error) return res.error(errors.internal.DB_FAILURE, error);

    var query = consumers.select(consumers.id).from(consumers)
      .where(consumers.userId.equals(userId));

    client.query(query.toQuery(), function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error);

      var consumer = result.rows[0];
      // console.log(consumer);
      if (consumer) { 
        // if we were given a consumerId in the body, compare against that
        if (consumerId) {
          if (consumer.id === consumerId) {
            cb('owner');
          } else {
            cb(null);
          }
        } else {
          // no consumerID was given, but the authed user is a consumer
          req.body.consumerId = consumer.id;
          cb('owner');
        }
      } else {
        // user is not a consumer
        cb(null);
      }
    });
  });
};