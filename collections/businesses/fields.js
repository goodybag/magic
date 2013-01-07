var db = require('../../db');
var businesses = db.tables.businesses;

module.exports = {
  businesses: {
    "default": {
      id        : businesses.id
    , name      : businesses.name
    , logoUrl   : businesses.logoUrl
    , isEnabled : businesses.isEnabled
    , $postRequires : ['name']
    }

  , client: {
      id        : businesses.id
    , name      : businesses.name
    , logoUrl   : businesses.logoUrl
    , isEnabled : businesses.isEnabled
    , $postRequires : ['name']
    }

  , sales: {
      id        : businesses.id
    , name      : businesses.name
    , logoUrl   : businesses.logoUrl
    , isEnabled : businesses.isEnabled
    , $postRequires : ['name']
    }

  , admin: {
      id        : businesses.id
    , name      : businesses.name
    , logoUrl   : businesses.logoUrl
    , isEnabled : businesses.isEnabled
    , $postRequires : ['name']
    }
  }
, business: {
    "default": {
      id        : businesses.id
    , name      : businesses.name
    , url       : businesses.url
    , logoUrl   : businesses.logoUrl
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
    , logoUrl   : businesses.logoUrl
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
    , logoUrl   : businesses.logoUrl
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
    , logoUrl   : businesses.logoUrl
    , street1   : businesses.street1
    , street2   : businesses.street2
    , city      : businesses.city
    , state     : businesses.state
    , zip       : businesses.zip
    , isEnabled : businesses.isEnabled
    , cardCode  : businesses.cardCode
    , $postRequires : ['name']
    }
  }
};