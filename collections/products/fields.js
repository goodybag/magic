var db = require('../../db');
var products = db.tables.products;
var productCategories = db.tables.productCategories;
var productTags = db.tables.productTags;

module.exports = {
  products: {
    "default": {
      id            : products.id
    , businessId    : products.businessId
    , name          : products.name
    , description   : products.description
    , price         : products.price
    , isVerified    : products.isVerified
    , isArchived    : products.isArchived
    , isEnabled     : products.isEnabled
    , categories    : true
    , $postRequires : ['name']
    }

  , client: {
      id            : products.id
    , businessId    : products.businessId
    , name          : products.name
    , description   : products.description
    , price         : products.price
    , isVerified    : products.isVerified
    , isArchived    : products.isArchived
    , isEnabled     : products.isEnabled
    , categories    : true
    , $postRequires : ['name']
    }

  , sales: {
      id            : products.id
    , businessId    : products.businessId
    , name          : products.name
    , description   : products.description
    , price         : products.price
    , isVerified    : products.isVerified
    , isArchived    : products.isArchived
    , isEnabled     : products.isEnabled
    , categories    : true
    , $postRequires : ['name']
    }

  , admin: {
      id            : products.id
    , businessId    : products.businessId
    , name          : products.name
    , description   : products.description
    , price         : products.price
    , isVerified    : products.isVerified
    , isArchived    : products.isArchived
    , isEnabled     : products.isEnabled
    , categories    : true
    , $postRequires : ['name']
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
    , categories   : true
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
    , categories   : true
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
    , categories   : true
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
    , categories   : true
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