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

  var consumerId = req.param('consumerId');

  if (consumerId === 'session') return cb('owner');

  db.getClient('consumers owner apply groups', function(error, client){
    if (error) return cb(null);

    var query = consumers.select(
      consumers.id
    ).where(
      consumers.userId.equals(req.session.user.id)
    ).toQuery();
    client.query(query, function(error, result){
      if (error) return cb(null);

      if (result.rows.length === 0) return cb(null);
      if (result.rows[0].id != consumerId) return cb(null);

      cb('owner');
    });
  });
};

exports.collectionOwner = function(req, callback){
  if (!req.session || !req.session.user || !req.session.user.groupIds) return cb(null);

  var
    collectionId = req.param('collectionId')
  , $query = { id: collectionId, consumerId: req.session.user.groupIds.consumer }
  , options = { fields: ['id'] }
  ;

  db.api.collections.findOne($query, options, function(error, collection){
    return callback(!error && collection ? 'owner' : null);
  });
};