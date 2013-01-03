var db = require('../../db');
var productCategories = db.tables.productCategories;

module.exports = {
  default: {
    'id':         productCategories.id
  , 'name':       productCategories.name
  , 'businessId': productCategories.businessId
  , 'isFeatured': productCategories.isFeatured
  , 'order':      productCategories.order
  , 'categories': true // allow categories to come through
  }
};