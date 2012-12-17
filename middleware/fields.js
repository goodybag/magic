var
  db = require('../db')
, businesses  = db.tables.businesses
, locations   = db.tables.locations
, products    = db.tables.products

, fields = {
    "businesses": {
      "default": [
        businesses.id
      , businesses.name
      , businesses.street1
      , businesses.street2
      , businesses.city
      , businesses.state
      , businesses.zip
      , businesses.isEnabled
      , businesses.cardCode
      ]

    , "client": [
        businesses.id
      , businesses.name
      , businesses.street1
      , businesses.street2
      , businesses.city
      , businesses.state
      , businesses.zip
      ]

    , "sales": [
        businesses.id
      , businesses.name
      , businesses.street1
      , businesses.street2
      , businesses.city
      , businesses.state
      , businesses.zip
      , businesses.isEnabled
      , businesses.cardCode
      ]

    , "admin": [
        businesses.id
      , businesses.name
      , businesses.street1
      , businesses.street2
      , businesses.city
      , businesses.state
      , businesses.zip
      , businesses.isEnabled
      , businesses.cardCode
      ]
    }

  , "locations": {
      "default": [
        locations.id
      , locations.businessId
      , locations.name
      , locations.street1
      , locations.street2
      , locations.city
      , locations.state
      , locations.zip
      , locations.country
      , locations.phone
      , locations.fax
      , locations.lat
      , locations.lon
      , locations.isEnabled
      ]

    , "client": [
        locations.id
      , locations.businessId
      , locations.name
      , locations.street1
      , locations.street2
      , locations.city
      , locations.state
      , locations.zip
      , locations.country
      , locations.phone
      , locations.fax
      , locations.lat
      , locations.lon
      , locations.isEnabled
      ]

    , "sales": [
        locations.id
      , locations.businessId
      , locations.name
      , locations.street1
      , locations.street2
      , locations.city
      , locations.state
      , locations.zip
      , locations.country
      , locations.phone
      , locations.fax
      , locations.lat
      , locations.lon
      ]

    , "admin": [
        locations.id
      , locations.businessId
      , locations.name
      , locations.street1
      , locations.street2
      , locations.city
      , locations.state
      , locations.zip
      , locations.country
      , locations.phone
      , locations.fax
      , locations.lat
      , locations.lon
      , locations.isEnabled
      ]
    }

  , "products": {
      "default": [
        products.id
      , products.businessId
      , products.name
      , products.description
      , products.price
      , products.isVerified
      , products.isEnabled
      ]

    , "client": [
        products.id
      , products.businessId
      , products.name
      , products.description
      , products.price
      , products.isVerified
      , products.isEnabled
      ]

    , "sales": [
        products.id
      , products.businessId
      , products.name
      , products.description
      , products.price
      , products.isVerified
      , products.isEnabled
      ]

    , "admin": [
        products.id
      , products.businessId
      , products.name
      , products.description
      , products.price
      , products.isVerified
      , products.isEnabled
      ]
    }
  }
;

module.exports = function(collection){
  return function(req, res, next){
    var group = "default";
    if (req.session && req.session.user) group = req.session.user.group;
    if (fields[collection] && fields[collection][group]){
      if (fields[collection][group].length === 0) return res.json({ error: null, data: [] });
      req.fields = fields[collection][group];
      next();
    }
  };
};