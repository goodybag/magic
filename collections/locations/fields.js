var db = require('../../db');
var locations = db.tables.locations;

module.exports = {
  access:{
    "default": {
      id             : locations.id
    , businessId     : locations.businessId
    , name           : locations.name
    , street1        : locations.street1
    , street2        : locations.street2
    , city           : locations.city
    , state          : locations.state
    , zip            : locations.zip
    , country        : locations.country
    , phone          : locations.phone
    , fax            : locations.fax
    , lat            : locations.lat
    , lon            : locations.lon
    , startSunday    : locations.startSunday
    , endSunday      : locations.endSunday
    , startMonday    : locations.startMonday
    , endMonday      : locations.endMonday
    , startTuesday   : locations.startTuesday
    , endTuesday     : locations.endTuesday
    , startWednesday : locations.startWednesday
    , endWednesday   : locations.endWednesday
    , startThursday  : locations.startThursday
    , endThursday    : locations.endThursday
    , startFriday    : locations.startFriday
    , endFriday      : locations.endFriday
    , startSaturday  : locations.startSaturday
    , endSaturday    : locations.endSaturday
    , isEnabled      : locations.isEnabled
    , tags           : true
    }

  , client: {
      id             : locations.id
    , businessId     : locations.businessId
    , name           : locations.name
    , street1        : locations.street1
    , street2        : locations.street2
    , city           : locations.city
    , state          : locations.state
    , zip            : locations.zip
    , country        : locations.country
    , phone          : locations.phone
    , fax            : locations.fax
    , lat            : locations.lat
    , lon            : locations.lon
    , startSunday    : locations.startSunday
    , endSunday      : locations.endSunday
    , startMonday    : locations.startMonday
    , endMonday      : locations.endMonday
    , startTuesday   : locations.startTuesday
    , endTuesday     : locations.endTuesday
    , startWednesday : locations.startWednesday
    , endWednesday   : locations.endWednesday
    , startThursday  : locations.startThursday
    , endThursday    : locations.endThursday
    , startFriday    : locations.startFriday
    , endFriday      : locations.endFriday
    , startSaturday  : locations.startSaturday
    , endSaturday    : locations.endSaturday
    , isEnabled      : locations.isEnabled
    , tags           : true
    }

  , sales: {
      id             : locations.id
    , businessId     : locations.businessId
    , name           : locations.name
    , street1        : locations.street1
    , street2        : locations.street2
    , city           : locations.city
    , state          : locations.state
    , zip            : locations.zip
    , country        : locations.country
    , phone          : locations.phone
    , fax            : locations.fax
    , lat            : locations.lat
    , lon            : locations.lon
    , startSunday    : locations.startSunday
    , endSunday      : locations.endSunday
    , startMonday    : locations.startMonday
    , endMonday      : locations.endMonday
    , startTuesday   : locations.startTuesday
    , endTuesday     : locations.endTuesday
    , startWednesday : locations.startWednesday
    , endWednesday   : locations.endWednesday
    , startThursday  : locations.startThursday
    , endThursday    : locations.endThursday
    , startFriday    : locations.startFriday
    , endFriday      : locations.endFriday
    , startSaturday  : locations.startSaturday
    , endSaturday    : locations.endSaturday
    , isEnabled      : locations.isEnabled
    , tags           : true
    }

  , admin: {
      id             : locations.id
    , businessId     : locations.businessId
    , name           : locations.name
    , street1        : locations.street1
    , street2        : locations.street2
    , city           : locations.city
    , state          : locations.state
    , zip            : locations.zip
    , country        : locations.country
    , phone          : locations.phone
    , fax            : locations.fax
    , lat            : locations.lat
    , lon            : locations.lon
    , startSunday    : locations.startSunday
    , endSunday      : locations.endSunday
    , startMonday    : locations.startMonday
    , endMonday      : locations.endMonday
    , startTuesday   : locations.startTuesday
    , endTuesday     : locations.endTuesday
    , startWednesday : locations.startWednesday
    , endWednesday   : locations.endWednesday
    , startThursday  : locations.startThursday
    , endThursday    : locations.endThursday
    , startFriday    : locations.startFriday
    , endFriday      : locations.endFriday
    , startSaturday  : locations.startSaturday
    , endSaturday    : locations.endSaturday
    , isEnabled      : locations.isEnabled
    , tags           : true
    }
  },
  accessOne:{
    "default": {
      id             : locations.id
    , businessId     : locations.businessId
    , name           : locations.name
    , street1        : locations.street1
    , street2        : locations.street2
    , city           : locations.city
    , state          : locations.state
    , zip            : locations.zip
    , country        : locations.country
    , phone          : locations.phone
    , fax            : locations.fax
    , lat            : locations.lat
    , lon            : locations.lon
    , startSunday    : locations.startSunday
    , endSunday      : locations.endSunday
    , startMonday    : locations.startMonday
    , endMonday      : locations.endMonday
    , startTuesday   : locations.startTuesday
    , endTuesday     : locations.endTuesday
    , startWednesday : locations.startWednesday
    , endWednesday   : locations.endWednesday
    , startThursday  : locations.startThursday
    , endThursday    : locations.endThursday
    , startFriday    : locations.startFriday
    , endFriday      : locations.endFriday
    , startSaturday  : locations.startSaturday
    , endSaturday    : locations.endSaturday
    , isEnabled      : locations.isEnabled
    , tags           : true
    }
  },
  create:{
    "default": {
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
    , startSunday    : locations.startSunday
    , endSunday      : locations.endSunday
    , startMonday    : locations.startMonday
    , endMonday      : locations.endMonday
    , startTuesday   : locations.startTuesday
    , endTuesday     : locations.endTuesday
    , startWednesday : locations.startWednesday
    , endWednesday   : locations.endWednesday
    , startThursday  : locations.startThursday
    , endThursday    : locations.endThursday
    , startFriday    : locations.startFriday
    , endFriday      : locations.endFriday
    , startSaturday  : locations.startSaturday
    , endSaturday    : locations.endSaturday
    , isEnabled      : locations.isEnabled
    , isEnabled  : locations.isEnabled
    , $postRequires : ['businessId']
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
    , startSunday    : locations.startSunday
    , endSunday      : locations.endSunday
    , startMonday    : locations.startMonday
    , endMonday      : locations.endMonday
    , startTuesday   : locations.startTuesday
    , endTuesday     : locations.endTuesday
    , startWednesday : locations.startWednesday
    , endWednesday   : locations.endWednesday
    , startThursday  : locations.startThursday
    , endThursday    : locations.endThursday
    , startFriday    : locations.startFriday
    , endFriday      : locations.endFriday
    , startSaturday  : locations.startSaturday
    , endSaturday    : locations.endSaturday
    , isEnabled      : locations.isEnabled
    , isEnabled  : locations.isEnabled
    , $postRequires : ['businessId']
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
    , startSunday    : locations.startSunday
    , endSunday      : locations.endSunday
    , startMonday    : locations.startMonday
    , endMonday      : locations.endMonday
    , startTuesday   : locations.startTuesday
    , endTuesday     : locations.endTuesday
    , startWednesday : locations.startWednesday
    , endWednesday   : locations.endWednesday
    , startThursday  : locations.startThursday
    , endThursday    : locations.endThursday
    , startFriday    : locations.startFriday
    , endFriday      : locations.endFriday
    , startSaturday  : locations.startSaturday
    , endSaturday    : locations.endSaturday
    , isEnabled      : locations.isEnabled
    , isEnabled  : locations.isEnabled
    , $postRequires : ['businessId']
    }
  },
  mutate:{
    // :NOTE: BUSINESS ID CAN NOT MUTATE!
    //        productLocations table would fall out of sync
    "default": {
    }

  , client: {
      name       : locations.name
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
    , startSunday    : locations.startSunday
    , endSunday      : locations.endSunday
    , startMonday    : locations.startMonday
    , endMonday      : locations.endMonday
    , startTuesday   : locations.startTuesday
    , endTuesday     : locations.endTuesday
    , startWednesday : locations.startWednesday
    , endWednesday   : locations.endWednesday
    , startThursday  : locations.startThursday
    , endThursday    : locations.endThursday
    , startFriday    : locations.startFriday
    , endFriday      : locations.endFriday
    , startSaturday  : locations.startSaturday
    , endSaturday    : locations.endSaturday
    , isEnabled      : locations.isEnabled
    , isEnabled  : locations.isEnabled
    }

  , sales: {
      name       : locations.name
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
    , startSunday    : locations.startSunday
    , endSunday      : locations.endSunday
    , startMonday    : locations.startMonday
    , endMonday      : locations.endMonday
    , startTuesday   : locations.startTuesday
    , endTuesday     : locations.endTuesday
    , startWednesday : locations.startWednesday
    , endWednesday   : locations.endWednesday
    , startThursday  : locations.startThursday
    , endThursday    : locations.endThursday
    , startFriday    : locations.startFriday
    , endFriday      : locations.endFriday
    , startSaturday  : locations.startSaturday
    , endSaturday    : locations.endSaturday
    , isEnabled      : locations.isEnabled
    , isEnabled  : locations.isEnabled
    }

  , admin: {
      name       : locations.name
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
    , startSunday    : locations.startSunday
    , endSunday      : locations.endSunday
    , startMonday    : locations.startMonday
    , endMonday      : locations.endMonday
    , startTuesday   : locations.startTuesday
    , endTuesday     : locations.endTuesday
    , startWednesday : locations.startWednesday
    , endWednesday   : locations.endWednesday
    , startThursday  : locations.startThursday
    , endThursday    : locations.endThursday
    , startFriday    : locations.startFriday
    , endFriday      : locations.endFriday
    , startSaturday  : locations.startSaturday
    , endSaturday    : locations.endSaturday
    , isEnabled      : locations.isEnabled
    , isEnabled  : locations.isEnabled
    }
  }
};