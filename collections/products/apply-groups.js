var db = require('../../db');
var sql = require('../../lib/sql');

//check to see if the user accessing this product
//is the manager at the specific business owning the product
//if so apply 'productBusinessManager' security group
var ownerManager = function(req, cb) {
  //do nothing if user not authenticated
  if(!req.session || !req.session.user) return cb();
  var user = req.session.user;

  //do nothing if user is not a manager
  var isManager = user.groups.indexOf('manager') > -1;
  if(!isManager) return cb();

  var query = sql.query([
    'SELECT managers.id',
    'FROM products ',
    'JOIN businesses ON products."businessId" = businesses.id',
    'JOIN managers ON businesses.id = managers."businessId"',
    'WHERE managers.id = $userId AND products.id = $productId',
  ''].join(' '))

  var productId = req.param('productId');
  var userId     = req.session.user.id;

  query.$('userId', userId);
  query.$('productId', productId);
  db.query(query, function(error, rows) {
    if(error || !rows.length) {
      return cb(null);
    }
    return cb('ownerManager');
  });
};

module.exports = {
  ownerManager: ownerManager
};
