var all = [
  'id'
, 'consumerId'
, 'businessId'
, 'businessName'
, 'locationId'
, 'numPunches'
, 'totalPunches'
, 'deltaPunches'
, 'numRewards'
, 'visitCount'
, 'lastVisit'
, 'isRegistered'
, 'isElite'
, 'dateBecameElite'
, 'reward'
, 'photoUrl'
, 'regularPunchesRequired'
, 'elitePunchesRequired'
, 'punchesRequiredToBecomeElite'
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
    , 'numRewards'
    , 'visitCount'
    , 'lastVisit'
    , 'isRegistered'
    , 'isElite'
    , 'dateBecameElite'
    , 'reward'
    , 'photoUrl'
    , 'regularPunchesRequired'
    , 'elitePunchesRequired'
    , 'punchesRequiredToBecomeElite'
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