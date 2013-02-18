var all = [
  'id'
, 'businessId'
, 'userId'
, 'cashierUserId'
, 'locationId'
, 'tapinStationId'
, 'dateTime'
, 'deltaPunches'
, 'numPunches'
, 'totalPunches'
, 'isElite'
, 'visitCount'
];

module.exports = {
  world: {
    read:   []
  , create: []
  , update: []
  }

, default: {}

, consumer: {
    read:   [
      'id'
    , 'businessId'
    , 'userId'
    , 'locationId'
    , 'isElite'
    , 'numPunches'
    , 'totalPunches'
    , 'dateTime'
    ]
  , create: []
  , update: []
  }

, locationEmployee: {
    read:   all
  , create: all
  , update: all
  }

, manager: {
    read:   all
  , create: all
  , update: all
  }

, cashier: {
    read:   all
  , create: all
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