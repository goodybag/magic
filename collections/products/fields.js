var db = require('../../db');
var products = db.tables.products;
var productCategories = db.tables.productCategories;
var productTags = db.tables.productTags;
var productLikes = db.tables.productLikes;
var productWants = db.tables.productWants;
var productTries = db.tables.productTries;
var photos = db.tables.photos;

module.exports = {
  access: {
    products: {
      "default": {
        id            : products.id
      , businessId    : products.businessId
      , businessName  : products.businessName
      , name          : products.name
      , description   : products.description
      , price         : products.price
      , photoUrl      : products.photoUrl
      , likes         : products.likes
      , wants         : products.wants
      , tries         : products.tries
      , isVerified    : products.isVerified
      , isArchived    : products.isArchived
      , isEnabled     : products.isEnabled
      , categories    : true
      , tags          : true
      }

    , client: {
        id            : products.id
      , businessId    : products.businessId
      , businessName  : products.businessName
      , name          : products.name
      , description   : products.description
      , price         : products.price
      , photoUrl      : products.photoUrl
      , likes         : products.likes
      , wants         : products.wants
      , tries         : products.tries
      , isVerified    : products.isVerified
      , isArchived    : products.isArchived
      , isEnabled     : products.isEnabled
      , categories    : true
      , tags          : true
      }

    , sales: {
        id            : products.id
      , businessId    : products.businessId
      , businessName  : products.businessName
      , name          : products.name
      , description   : products.description
      , price         : products.price
      , photoUrl      : products.photoUrl
      , likes         : products.likes
      , wants         : products.wants
      , tries         : products.tries
      , isVerified    : products.isVerified
      , isArchived    : products.isArchived
      , isEnabled     : products.isEnabled
      , categories    : true
      , tags          : true
      }

    , admin: {
        id            : products.id
      , businessId    : products.businessId
      , businessName  : products.businessName
      , name          : products.name
      , description   : products.description
      , price         : products.price
      , photoUrl      : products.photoUrl
      , likes         : products.likes
      , wants         : products.wants
      , tries         : products.tries
      , isVerified    : products.isVerified
      , isArchived    : products.isArchived
      , isEnabled     : products.isEnabled
      , categories    : true
      , tags          : true
      }
    }

  , product: {
      "default": {
        id           : products.id
      , businessId   : products.businessId
      , name         : products.name
      , description  : products.description
      , price        : products.price
      , photoUrl     : products.photoUrl
      , likes        : products.likes
      , wants        : products.wants
      , tries        : products.tries
      , isVerified   : products.isVerified
      , isArchived   : products.isArchived
      , isEnabled    : products.isEnabled
      , categoryId   : productCategories.id
      , categoryName : productCategories.name
      , tagId        : productTags.id
      , tag          : productTags.tag
      , tags         : true
      , categories   : true
      }

    , client: {
        id           : products.id
      , businessId   : products.businessId
      , name         : products.name
      , description  : products.description
      , price        : products.price
      , photoUrl     : products.photoUrl
      , likes        : products.likes
      , wants        : products.wants
      , tries        : products.tries
      , isVerified   : products.isVerified
      , isArchived   : products.isArchived
      , isEnabled    : products.isEnabled
      , categoryId   : productCategories.id
      , categoryName : productCategories.name
      , tagId        : productTags.id
      , tag          : productTags.tag
      , tags         : true
      , categories   : true
      }

    , sales: {
        id           : products.id
      , businessId   : products.businessId
      , name         : products.name
      , description  : products.description
      , price        : products.price
      , photoUrl     : products.photoUrl
      , likes        : products.likes
      , wants        : products.wants
      , tries        : products.tries
      , isVerified   : products.isVerified
      , isArchived   : products.isArchived
      , isEnabled    : products.isEnabled
      , categoryId   : productCategories.id
      , categoryName : productCategories.name
      , tagId        : productTags.id
      , tag          : productTags.tag
      , tags         : true
      , categories   : true
      }

    , admin: {
        id           : products.id
      , businessId   : products.businessId
      , name         : products.name
      , description  : products.description
      , price        : products.price
      , photoUrl     : products.photoUrl
      , likes        : products.likes
      , wants        : products.wants
      , tries        : products.tries
      , isVerified   : products.isVerified
      , isArchived   : products.isArchived
      , isEnabled    : products.isEnabled
      , categoryId   : productCategories.id
      , categoryName : productCategories.name
      , tagId        : productTags.id
      , tag          : productTags.tag
      , tags         : true
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
  },
  create: {
    product: {
      "default": {
      }

    , sales: {
        businessId   : products.businessId
      , name         : products.name
      , description  : products.description
      , price        : products.price
      , isVerified   : products.isVerified
      , isArchived   : products.isArchived
      , isEnabled    : products.isEnabled
      , categoryId   : productCategories.id
      , categoryName : productCategories.name
      , tagId        : productTags.id
      , tag          : productTags.tag
      , tags         : true
      , categories   : true
      , $postRequires : ['name']
      }

    , admin: {
        businessId   : products.businessId
      , name         : products.name
      , description  : products.description
      , price        : products.price
      , likes        : products.likes
      , wants        : products.wants
      , tries        : products.tries
      , isVerified   : products.isVerified
      , isArchived   : products.isArchived
      , isEnabled    : products.isEnabled
      , categoryId   : productCategories.id
      , categoryName : productCategories.name
      , tagId        : productTags.id
      , tag          : productTags.tag
      , tags         : true
      , categories   : true
      , $postRequires : ['name']
      }
    }

  , productCategory: {
    "default": {
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
  },
  mutate: {
    // :NOTE: BUSINESS ID CAN NOT MUTATE!
    //        productLocations table would fall out of sync
    product: {
      "default": {
      }

    , owner: {
        name         : products.name
      , description  : products.description
      , price        : products.price
      , isEnabled    : products.isEnabled
      , tags         : true
      , categories   : true
      , $postRequires : ['name']
      }

    , sales: {
        name         : products.name
      , description  : products.description
      , price        : products.price
      , isVerified   : products.isVerified
      , isArchived   : products.isArchived
      , isEnabled    : products.isEnabled
      , categoryId   : productCategories.id
      , categoryName : productCategories.name
      , tagId        : productTags.id
      , tag          : productTags.tag
      , tags         : true
      , categories   : true
      , $postRequires : ['name']
      }

    , admin: {
        name         : products.name
      , description  : products.description
      , price        : products.price
      , likes        : products.likes
      , wants        : products.wants
      , tries        : products.tries
      , isVerified   : products.isVerified
      , isArchived   : products.isArchived
      , isEnabled    : products.isEnabled
      , categoryId   : productCategories.id
      , categoryName : productCategories.name
      , tagId        : productTags.id
      , tag          : productTags.tag
      , tags         : true
      , categories   : true
      , $postRequires : ['name']
      }
    }
  }
}; 
