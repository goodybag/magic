var all = [
  'id'
, 'userId'
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
, 'requiredItem'
, 'businessLogo'
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
    , 'userId'
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
    , 'requiredItem'
    , 'businessLogo'
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