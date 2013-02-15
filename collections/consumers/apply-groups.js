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

  var userId = req.param('userId');
  if (userId === 'session') return cb('owner');
  if (userId === req.session.user.id) return cb('owner');
  cb(null);
};

exports.collectionOwner = function(req, callback){
  if (!req.session || !req.session.user) return cb(null);

  var
    collectionId = req.param('collectionId')
  , $query = { id: collectionId, userId: req.session.user.id }
  , options = { fields: ['id'] }
  ;

  db.api.collections.findOne($query, options, function(error, collection){
    return callback(!error && collection ? 'owner' : null);
  });
};