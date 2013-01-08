var db = require('../../db');
var businesses = db.tables.businesses;

module.exports = {
  "default": {
    id        : businesses.id
  , name      : businesses.name
  , url       : businesses.url
  , street1   : businesses.street1
  , street2   : businesses.street2
  , city      : businesses.city
  , state     : businesses.state
  , zip       : businesses.zip
  , isEnabled : businesses.isEnabled
  , cardCode  : businesses.cardCode
  , $postRequires : ['name']
  }

, client: {
    id        : businesses.id
  , name      : businesses.name
  , url       : businesses.url
  , street1   : businesses.street1
  , street2   : businesses.street2
  , city      : businesses.city
  , state     : businesses.state
  , zip       : businesses.zip
  , $postRequires : ['name']
  }

, sales: {
    id        : businesses.id
  , name      : businesses.name
  , url       : businesses.url
  , street1   : businesses.street1
  , street2   : businesses.street2
  , city      : businesses.city
  , state     : businesses.state
  , zip       : businesses.zip
  , isEnabled : businesses.isEnabled
  , cardCode  : businesses.cardCode
  , $postRequires : ['name']
  }

, admin: {
    id        : businesses.id
  , name      : businesses.name
  , url       : businesses.url
  , street1   : businesses.street1
  , street2   : businesses.street2
  , city      : businesses.city
  , state     : businesses.state
  , zip       : businesses.zip
  , isEnabled : businesses.isEnabled
  , cardCode  : businesses.cardCode
  , $postRequires : ['name']
  }
};