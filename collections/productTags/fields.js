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
  }

, client: {
    id         : productTags.id
  , businessId : productTags.businessId
  , productId  : productTags.productId
  , tag        : productTags.tag
  , createdAt  : productTags.createdAt
  }

, sales: {
    id         : productTags.id
  , businessId : productTags.businessId
  , productId  : productTags.productId
  , tag        : productTags.tag
  , createdAt  : productTags.createdAt
  }

, admin: {
    id         : productTags.id
  , businessId : productTags.businessId
  , productId  : productTags.productId
  , tag        : productTags.tag
  , createdAt  : productTags.createdAt
  }
};