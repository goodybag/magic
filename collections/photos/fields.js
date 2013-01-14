var db = require('../../db');
var photos = db.tables.photos;
var products = db.tables.products;

module.exports = {
  get: {
    "default": {
      id               : photos.id
    , businessId       : photos.businessId
    , productId        : photos.productId
    , productName      : products.name
    , consumerId       : photos.consumerId
    , url              : photos.url
    , notes            : photos.notes
    , lat              : photos.lat
    , lon              : photos.lon
    , isProductDefault : photos.isProductDefault
    , isEnabled        : photos.isEnabled
    , createdAt        : photos.createdAt
    }

  , client: {
      id               : photos.id
    , businessId       : photos.businessId
    , productId        : photos.productId
    , productName      : products.name
    , consumerId       : photos.consumerId
    , url              : photos.url
    , notes            : photos.notes
    , lat              : photos.lat
    , lon              : photos.lon
    , isProductDefault : photos.isProductDefault
    , isEnabled        : photos.isEnabled
    , createdAt        : photos.createdAt
    }

  , sales: {
      id               : photos.id
    , businessId       : photos.businessId
    , productId        : photos.productId
    , productName      : products.name
    , consumerId       : photos.consumerId
    , url              : photos.url
    , notes            : photos.notes
    , lat              : photos.lat
    , lon              : photos.lon
    , isProductDefault : photos.isProductDefault
    , isEnabled        : photos.isEnabled
    , createdAt        : photos.createdAt
    }

  , admin: {
      id               : photos.id
    , businessId       : photos.businessId
    , productId        : photos.productId
    , productName      : products.name
    , consumerId       : photos.consumerId
    , url              : photos.url
    , notes            : photos.notes
    , lat              : photos.lat
    , lon              : photos.lon
    , isProductDefault : photos.isProductDefault
    , isEnabled        : photos.isEnabled
    , createdAt        : photos.createdAt
    }
  },
  modify: {
    "default": {
      id               : photos.id
    , businessId       : photos.businessId
    , productId        : photos.productId
    , consumerId       : photos.consumerId
    , url              : photos.url
    , notes            : photos.notes
    , lat              : photos.lat
    , lon              : photos.lon
    , isEnabled        : photos.isEnabled
    , createdAt        : photos.createdAt
    , $postRequires : ['url']
    }

  , client: {
      id               : photos.id
    , businessId       : photos.businessId
    , productId        : photos.productId
    , consumerId       : photos.consumerId
    , url              : photos.url
    , notes            : photos.notes
    , lat              : photos.lat
    , lon              : photos.lon
    , isEnabled        : photos.isEnabled
    , createdAt        : photos.createdAt
    , $postRequires : ['url']
    }

  , sales: {
      id               : photos.id
    , businessId       : photos.businessId
    , productId        : photos.productId
    , consumerId       : photos.consumerId
    , url              : photos.url
    , notes            : photos.notes
    , lat              : photos.lat
    , lon              : photos.lon
    , isProductDefault : photos.isProductDefault
    , isEnabled        : photos.isEnabled
    , createdAt        : photos.createdAt
    , $postRequires : ['url']
    }

  , admin: {
      id               : photos.id
    , businessId       : photos.businessId
    , productId        : photos.productId
    , consumerId       : photos.consumerId
    , url              : photos.url
    , notes            : photos.notes
    , lat              : photos.lat
    , lon              : photos.lon
    , isProductDefault : photos.isProductDefault
    , isEnabled        : photos.isEnabled
    , createdAt        : photos.createdAt
    , $postRequires : ['url']
    }

  }
};