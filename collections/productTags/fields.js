var db = require('../../db');
var productTags = db.tables.productTags;

module.exports = {
  "default": {
    id  : productTags.id
  , tag : productTags.tag
  }

, client: {
    id  : productTags.id
  , tag : productTags.tag
  }

, sales: {
    id  : productTags.id
  , tag : productTags.tag
  }

, admin: {
    id  : productTags.id
  , tag : productTags.tag
  }
};