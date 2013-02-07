var all = [
  'id'
, 'consumerId'
, 'businessId'
, 'locationId'
, 'numPunches'
, 'totalPunches'
, 'deltaPunches'
, 'numRewards'
, 'visitCount'
, 'lastVisit'
, 'isElite'
, 'dateBecameElite'
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
    , 'numRewards'
    , 'visitCount'
    , 'lastVisit'
    , 'isElite'
    , 'dateBecameElite'
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