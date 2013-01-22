var db = require('../../db');
var productCategories = db.tables.productCategories;

module.exports = {
  default: {
    id          : productCategories.id
  , name        : productCategories.name
  , description : productCategories.description
  , businessId  : productCategories.businessId
  , isFeatured  : productCategories.isFeatured
  , order       : productCategories.order
  , categories  : true 
  , $postRequires : ['name', 'businessId']
  }
};