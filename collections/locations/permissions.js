module.exports = {
  world: {
    read:   [
      'id'
    , 'businessId'
    , 'name'
    , 'businessName'
    , 'logoUrl'
    , 'tags'
    , 'lat'
    , 'lon'
    , 'street1'
    , 'street2'
    , 'city'
    , 'state'
    , 'zip'
    , 'country'
    ]
  , create: []
  , update: []
  }

, default: {
    read:   [
      'phone'
    , 'fax'
    , 'startSunday'
    , 'endSunday'
    , 'startMonday'
    , 'endMonday'
    , 'startTuesday'
    , 'endTuesday'
    , 'startWednesday'
    , 'endWednesday'
    , 'startThursday'
    , 'endThursday'
    , 'startFriday'
    , 'endFriday'
    , 'startSaturday'
    , 'endSaturday'
    ]
  }

, manager: {
    read: ['lastKeyTagRequest', 'keyTagRequestPending']
  }

, ownerManager: {
    read:   true
  , update: true
  }

, sales: {
    read:   true
  , create: true
  , update: true
  }

, admin: {
    read:   true
  , create: true
  , update: true
  }
};
