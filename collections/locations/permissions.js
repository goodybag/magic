module.exports = {
  world: {
    read:   ['id', 'businessId', 'name']
  , create: []
  , update: []
  }

, default: {
    read:   [
      'street1'
    , 'street2'
    , 'city'
    , 'state'
    , 'zip'
    , 'country'
    , 'phone'
    , 'fax'
    , 'lat'
    , 'lon'
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
    , 'isEnabled'
    , 'tags'
    ]
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