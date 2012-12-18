var db = require('../../../db');
var products = db.tables.products;

module.exports = {
  "default": [
    products.id
  , products.businessId
  , products.name
  , products.description
  , products.price
  , products.isVerified
  , products.isArchived
  , products.isEnabled
  ]

, "client": [
    products.id
  , products.businessId
  , products.name
  , products.description
  , products.price
  , products.isVerified
  , products.isArchived
  , products.isEnabled
  ]

, "sales": [
    products.id
  , products.businessId
  , products.name
  , products.description
  , products.price
  , products.isVerified
  , products.isArchived
  , products.isEnabled
  ]

, "admin": [
    products.id
  , products.businessId
  , products.name
  , products.description
  , products.price
  , products.isVerified
  , products.isArchived
  , products.isEnabled
  ]
};