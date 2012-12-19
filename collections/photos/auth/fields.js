var db = require('../../../db');
var photos = db.tables.photos;

module.exports = {
  "default": {
    id         : photos.id
  , businessId : photos.businessId
  , productId  : photos.productId
  , consumerId : photos.consumerId
  , url        : photos.url
  , notes      : photos.notes
  , lat        : photos.lat
  , lon        : photos.lon
  , isEnabled  : photos.isEnabled
  , createdAt  : photos.createdAt
  }

, client: {
    id         : photos.id
  , businessId : photos.businessId
  , productId  : photos.productId
  , consumerId : photos.consumerId
  , url        : photos.url
  , notes      : photos.notes
  , lat        : photos.lat
  , lon        : photos.lon
  , isEnabled  : photos.isEnabled
  , createdAt  : photos.createdAt
  }

, sales: {
    id         : photos.id
  , businessId : photos.businessId
  , productId  : photos.productId
  , consumerId : photos.consumerId
  , url        : photos.url
  , notes      : photos.notes
  , lat        : photos.lat
  , lon        : photos.lon
  , isEnabled  : photos.isEnabled
  , createdAt  : photos.createdAt
  }

, admin: {
    id         : photos.id
  , businessId : photos.businessId
  , productId  : photos.productId
  , consumerId : photos.consumerId
  , url        : photos.url
  , notes      : photos.notes
  , lat        : photos.lat
  , lon        : photos.lon
  , isEnabled  : photos.isEnabled
  , createdAt  : photos.createdAt
  }
};