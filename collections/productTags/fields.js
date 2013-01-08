var db = require('../../db');
var productTags = db.tables.productTags;
var products = db.tables.products;

module.exports = {
  "default": {
    tag : productTags.tag
  }

, client: {
    tag : productTags.tag
  }

, sales: {
    tag : productTags.tag
  }

, admin: {
    tag : productTags.tag
  }
};