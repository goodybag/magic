var db = require('../../db');
var businesses = db.tables.businesses;

module.exports = {
  businesses: {
    "default": {
      id        : businesses.id
    , name      : businesses.name
    , logoUrl   : businesses.logoUrl
    , isGB      : businesses.isGB
    , isVerified: businesses.isVerified
    , isEnabled : businesses.isEnabled
    , $postRequires : ['name']
    }

  , client: {
      id        : businesses.id
    , name      : businesses.name
    , logoUrl   : businesses.logoUrl
    , isGB      : businesses.isGB
    , isVerified: businesses.isVerified
    , isEnabled : businesses.isEnabled
    , $postRequires : ['name']
    }

  , sales: {
      id        : businesses.id
    , name      : businesses.name
    , logoUrl   : businesses.logoUrl
    , isGB      : businesses.isGB
    , isVerified: businesses.isVerified
    , isEnabled : businesses.isEnabled
    , $postRequires : ['name']
    }

  , admin: {
      id        : businesses.id
    , name      : businesses.name
    , logoUrl   : businesses.logoUrl
    , isGB      : businesses.isGB
    , isVerified: businesses.isVerified
    , isEnabled : businesses.isEnabled
    , $postRequires : ['name']
    }
  }
, business: {
    "default": {
      id        : businesses.id
    , charityId : businesses.charityId
    , name      : businesses.name
    , url       : businesses.url
    , logoUrl   : businesses.logoUrl
    , street1   : businesses.street1
    , street2   : businesses.street2
    , city      : businesses.city
    , state     : businesses.state
    , zip       : businesses.zip
    , isGB      : businesses.isGB
    , isVerified: businesses.isVerified
    , isEnabled : businesses.isEnabled
    , cardCode  : businesses.cardCode
    , $postRequires : ['name']
    }

  , client: {
      id        : businesses.id
    , charityId : businesses.charityId
    , name      : businesses.name
    , url       : businesses.url
    , logoUrl   : businesses.logoUrl
    , street1   : businesses.street1
    , street2   : businesses.street2
    , city      : businesses.city
    , state     : businesses.state
    , zip       : businesses.zip
    , isGB      : businesses.isGB
    , isVerified: businesses.isVerified
    , $postRequires : ['name']
    }

  , sales: {
      id        : businesses.id
    , charityId : businesses.charityId
    , name      : businesses.name
    , url       : businesses.url
    , logoUrl   : businesses.logoUrl
    , street1   : businesses.street1
    , street2   : businesses.street2
    , city      : businesses.city
    , state     : businesses.state
    , zip       : businesses.zip
    , isGB      : businesses.isGB
    , isVerified: businesses.isVerified
    , isEnabled : businesses.isEnabled
    , cardCode  : businesses.cardCode
    , $postRequires : ['name']
    }

  , admin: {
      id        : businesses.id
    , charityId : businesses.charityId
    , name      : businesses.name
    , url       : businesses.url
    , logoUrl   : businesses.logoUrl
    , street1   : businesses.street1
    , street2   : businesses.street2
    , city      : businesses.city
    , state     : businesses.state
    , zip       : businesses.zip
    , isGB      : businesses.isGB
    , isVerified: businesses.isVerified
    , isEnabled : businesses.isEnabled
    , cardCode  : businesses.cardCode
    , $postRequires : ['name']
    }
  }
};