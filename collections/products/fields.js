var db = require('../../db');
var products = db.tables.products;
var productCategories = db.tables.productCategories;
var productTags = db.tables.productTags;

module.exports = {
  products: {
    "default": {
      id           : products.id
    , businessId   : products.businessId
    , name         : products.name
    , description  : products.description
    , price        : products.price
    , isVerified   : products.isVerified
    , isArchived   : products.isArchived
    , isEnabled    : products.isEnabled
    }

  , client: {
      id           : products.id
    , businessId   : products.businessId
    , name         : products.name
    , description  : products.description
    , price        : products.price
    , isVerified   : products.isVerified
    , isArchived   : products.isArchived
    , isEnabled    : products.isEnabled
    }

  , sales: {
      id           : products.id
    , businessId   : products.businessId
    , name         : products.name
    , description  : products.description
    , price        : products.price
    , isVerified   : products.isVerified
    , isArchived   : products.isArchived
    , isEnabled    : products.isEnabled
    }

  , admin: {
      id           : products.id
    , businessId   : products.businessId
    , name         : products.name
    , description  : products.description
    , price        : products.price
    , isVerified   : products.isVerified
    , isArchived   : products.isArchived
    , isEnabled    : products.isEnabled
    }
  }

, product: {
    "default": {
      id           : products.id
    , businessId   : products.businessId
    , name         : products.name
    , description  : products.description
    , price        : products.price
    , isVerified   : products.isVerified
    , isArchived   : products.isArchived
    , isEnabled    : products.isEnabled
    , categoryId   : productCategories.id
    , categoryName : productCategories.name
    , tag          : productTags.tag
    }

  , client: {
      id           : products.id
    , businessId   : products.businessId
    , name         : products.name
    , description  : products.description
    , price        : products.price
    , isVerified   : products.isVerified
    , isArchived   : products.isArchived
    , isEnabled    : products.isEnabled
    , categoryId   : productCategories.id
    , categoryName : productCategories.name
    , tag          : productTags.tag
    }

  , sales: {
      id           : products.id
    , businessId   : products.businessId
    , name         : products.name
    , description  : products.description
    , price        : products.price
    , isVerified   : products.isVerified
    , isArchived   : products.isArchived
    , isEnabled    : products.isEnabled
    , categoryId   : productCategories.id
    , categoryName : productCategories.name
    , tag          : productTags.tag
    }

  , admin: {
      id           : products.id
    , businessId   : products.businessId
    , name         : products.name
    , description  : products.description
    , price        : products.price
    , isVerified   : products.isVerified
    , isArchived   : products.isArchived
    , isEnabled    : products.isEnabled
    , categoryId   : productCategories.id
    , categoryName : productCategories.name
    , tag          : productTags.tag
    }
  }

, productCategory: {
  "default": {
      id   : productCategories.id
    , name : productCategories.name
    }

  , client: {
      id   : productCategories.id
    , name : productCategories.name
    }

  , sales: {
      id   : productCategories.id
    , name : productCategories.name
    }

  , admin: {
      id   : productCategories.id
    , name : productCategories.name
    }
  }
};