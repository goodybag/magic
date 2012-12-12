var
  db = require('../db')
, businesses  = db.tables.businesses
, locations   = db.tables.locations

, fields = {
    "businesses": {
      "anonymous": [
        businesses.id
      , businesses.name
      , businesses.enabled
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

    , "default": [
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
      "anonymous": [
        locations.id
      , locations.businessId
      , locations.name
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
      , locations.lng
      ]

    , "default": [
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
      , locations.lng
      ]
    }
  }
;

module.exports = function(collection){
  return function(req, res, next){
    var group = "anonymous";
    if (req.session && req.session.user) group = req.session.user.group;
    if (fields[collection] && fields[collection][group]){
      if (fields[collection][group].length === 0) return res.json({ error: null, data: [] });
      req.fields = fields[collection][group];
      next();
    }
  };
};