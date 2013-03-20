var all = [
  'id'
, 'email'
, 'password'
, 'id'
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
  , update: all
  }

, sales: {
    read:   all
  , create: all
  , update: all
  }

, admin: {
    read:   all
  , create: all
  , update: all
  }
};