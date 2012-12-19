var db = require('../../../db');
var products = db.tables.products;

module.exports = {
  "default": {
    id          : products.id
  , businessId  : products.businessId
  , name        : products.name
  , description : products.description
  , price       : products.price
  , isVerified  : products.isVerified
  , isArchived  : products.isArchived
  , isEnabled   : products.isEnabled
  }

, client: {
    id          : products.id
  , businessId  : products.businessId
  , name        : products.name
  , description : products.description
  , price       : products.price
  , isVerified  : products.isVerified
  , isArchived  : products.isArchived
  , isEnabled   : products.isEnabled
  }

, sales: {
    id          : products.id
  , businessId  : products.businessId
  , name        : products.name
  , description : products.description
  , price       : products.price
  , isVerified  : products.isVerified
  , isArchived  : products.isArchived
  , isEnabled   : products.isEnabled
  }

, admin: {
    id          : products.id
  , businessId  : products.businessId
  , name        : products.name
  , description : products.description
  , price       : products.price
  , isVerified  : products.isVerified
  , isArchived  : products.isArchived
  , isEnabled   : products.isEnabled
  }
};