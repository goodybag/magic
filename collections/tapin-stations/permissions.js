var all = [
  'id'
, 'email'
, 'tapinStationId'
, 'businessId'
, 'locationId'
, 'loyaltyEnabled'
, 'galleryEnabled'
, 'numUnconfirmedPunchesAllowed'
, 'createdAt'
];

module.exports = {
  world: {
    read:   []
  , create: []
  , update: []
  }

, default: {}

, owner: {
    read:   all
  , update: all.concat('password')
  }

, sales: {
    read:   all
  , create: all.concat('password')
  , update: all.concat('password')
  }

, admin: {
    read:   all
  , create: all.concat('password')
  , update: all.concat('password')
  }
};