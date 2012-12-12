var
  db = require('../db')
, businesses  = db.tables.businesses
, locations   = db.tables.locations
, users = db.tables.users


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