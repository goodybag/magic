module.exports.business = {
  world: {
    read:   ['id', 'name', 'locations:locations', 'tags', 'isGB']
  , create: []
  , update: []
  }

, default: {
    read:   ['charityId', 'url', 'logoUrl', 'menuDescription']
  }

, consumer: {
    create: ['name']
  }

, owner: {
    read:   ['street1', 'street2', 'city', 'state', 'zip']
  , update: ['name', 'url', 'menuDescription', 'street1', 'street2', 'city', 'state', 'zip']
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

module.exports.loyalty = {
  world: {
    read:   [
      'id'
    , 'businessId'
    , 'reward'
    , 'requiredItem'
    , 'regularPunchesRequired'
    , 'elitePunchesRequired'
    , 'punchesRequiredToBecomeElite'
    , 'photoUrl'
    ]
  , create: []
  , update: []
  }

, default: {}

, ownerManager: {
    update: [
      'reward'
    , 'requiredItem'
    , 'regularPunchesRequired'
    , 'elitePunchesRequired'
    , 'punchesRequiredToBecomeElite'
    , 'photoUrl'
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