/**
 * User permissions
 */

exports.owner = function(req, cb) {
  var userId = req.param('id');
  if (req.session.user && userId == req.session.user.id) {
    cb('owner');
  } else {
    cb(null);
  }
};