var db = require('../../db');
var charities = db.tables.charities;

module.exports = {
  access: {
    "default": {
      id            : charities.id
    , name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , joinDate      : charities.joinDate
    , totalReceived : charities.totalReceived
    }

  , client: {
      id            : charities.id
    , name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , joinDate      : charities.joinDate
    , totalReceived : charities.totalReceived
    }

  , sales: {
      id            : charities.id
    , name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , joinDate      : charities.joinDate
    , totalReceived : charities.totalReceived
    }

  , admin: {
      id            : charities.id
    , name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , joinDate      : charities.joinDate
    , totalReceived : charities.totalReceived
    }
  }
, create: {
    "default": {
      name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , $postRequires : ['name']
    }

  , client: {
      name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , $postRequires : ['name']
    }

  , sales: {
      name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , $postRequires : ['name']
    }

  , admin: {
      name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , $postRequires : ['name']
    }
  }
, mutate: {
    "default": {
      name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , joinDate      : charities.joinDate
    , totalReceived : charities.totalReceived
    }

  , client: {
      name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , joinDate      : charities.joinDate
    , totalReceived : charities.totalReceived
    }

  , sales: {
      name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , joinDate      : charities.joinDate
    , totalReceived : charities.totalReceived
    }

  , admin: {
      name          : charities.name
    , desc          : charities.desc
    , logoUrl       : charities.logoUrl
    , joinDate      : charities.joinDate
    , totalReceived : charities.totalReceived
    }
  }
};