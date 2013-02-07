var all = [
  'id'
, 'consumerId'
, 'businessId'
, 'businessName'
, 'locationId'
, 'numPunches'
, 'totalPunches'
, 'deltaPunches'
, 'visitCount'
, 'lastVisit'
, 'isElite'
, 'dateBecameElite'
, 'reward'
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
    , 'businessName'
    , 'numPunches'
    , 'totalPunches'
    , 'visitCount'
    , 'lastVisit'
    , 'isElite'
    , 'dateBecameElite'
    , 'reward'
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