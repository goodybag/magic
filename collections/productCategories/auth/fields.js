var db = require('../../../db');
var products = db.tables.productCategories;

module.exports = {
  default: [
    'id'
  , 'name'
  , 'businessId'
  , 'isFeatured'
  , 'order'
  ]
};