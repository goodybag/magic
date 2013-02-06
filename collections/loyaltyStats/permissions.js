var all = [
  'id'
, 'consumerId'
, 'businessId'
, 'locationId'
, 'numPunches'
, 'totalPunches'
, 'deltaPunches'
, 'visitCount'
, 'lastVisit'
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
    , 'consumerId'
    , 'businessId'
    , 'numPunches'
    , 'totalPunches'
    , 'visitCount'
    , 'lastVisit'
    ]
  }

, employee: {
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