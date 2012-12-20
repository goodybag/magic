var db = require('../../db');
var locations = db.tables.locations;

module.exports = {
  "default": {
    id         : locations.id
  , businessId : locations.businessId
  , name       : locations.name
  , street1    : locations.street1
  , street2    : locations.street2
  , city       : locations.city
  , state      : locations.state
  , zip        : locations.zip
  , country    : locations.country
  , phone      : locations.phone
  , fax        : locations.fax
  , lat        : locations.lat
  , lon        : locations.lon
  , isEnabled  : locations.isEnabled
  }

, client: {
    id         : locations.id
  , businessId : locations.businessId
  , name       : locations.name
  , street1    : locations.street1
  , street2    : locations.street2
  , city       : locations.city
  , state      : locations.state
  , zip        : locations.zip
  , country    : locations.country
  , phone      : locations.phone
  , fax        : locations.fax
  , lat        : locations.lat
  , lon        : locations.lon
  , isEnabled  : locations.isEnabled
  }

, sales: {
    id         : locations.id
  , businessId : locations.businessId
  , name       : locations.name
  , street1    : locations.street1
  , street2    : locations.street2
  , city       : locations.city
  , state      : locations.state
  , zip        : locations.zip
  , country    : locations.country
  , phone      : locations.phone
  , fax        : locations.fax
  , lat        : locations.lat
  , lon        : locations.lon
  , isEnabled  : locations.isEnabled
  }

, admin: {
    id         : locations.id
  , businessId : locations.businessId
  , name       : locations.name
  , street1    : locations.street1
  , street2    : locations.street2
  , city       : locations.city
  , state      : locations.state
  , zip        : locations.zip
  , country    : locations.country
  , phone      : locations.phone
  , fax        : locations.fax
  , lat        : locations.lat
  , lon        : locations.lon
  , isEnabled  : locations.isEnabled
  }
};