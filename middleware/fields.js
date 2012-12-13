var
  db = require('../db')
, businesses  = db.tables.businesses
, locations   = db.tables.locations

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
      , businesses.enabled
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
      , businesses.enabled
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
      , businesses.enabled
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
      , locations.enabled
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
      , locations.enabled
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
      , locations.enabled
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