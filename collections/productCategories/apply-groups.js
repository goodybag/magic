var db = require('../../db');
var applyBusinessManager = function(req, res, next) {

  //do nothing if user not authenticated
  if(!req.session || !req.session.user) return next();
  var user = req.session.user;

  //do nothing if user is not a manager
  var isManager = user.groups.indexOf('manager') > -1;
  if(!isManager) return next();

  //lookup user manager record(s) for user
  db.query('SELECT * FROM managers WHERE id = $1', [user.id], function(error, rows) {
    if(error) return next(error);
    for(var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if(row.businessId == req.params.businessId) {
        user.groups.push('businessManager');
        break;
      }
    }
    next();
  });
};

module.exports = {
  businessManager: applyBusinessManager
};
