var db = require('../../db');
var productTags = db.tables.productTags;
var products = db.tables.products;

module.exports = {
  "default": {
    id         : productTags.id
  , businessId : productTags.businessId
  , productId  : productTags.productId
  , tag        : productTags.tag
  , createdAt  : productTags.createdAt
  , $postRequires : ['businessId', 'tag']
  }

, client: {
    id         : productTags.id
  , businessId : productTags.businessId
  , productId  : productTags.productId
  , tag        : productTags.tag
  , createdAt  : productTags.createdAt
  , $postRequires : ['businessId', 'tag']
  }

, sales: {
    id         : productTags.id
  , businessId : productTags.businessId
  , productId  : productTags.productId
  , tag        : productTags.tag
  , createdAt  : productTags.createdAt
  , $postRequires : ['businessId', 'tag']
  }

, admin: {
    id         : productTags.id
  , businessId : productTags.businessId
  , productId  : productTags.productId
  , tag        : productTags.tag
  , createdAt  : productTags.createdAt
  , $postRequires : ['businessId', 'tag']
  }
};