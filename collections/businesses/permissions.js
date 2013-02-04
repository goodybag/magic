module.exports.business = {
  world: {
    read:   ['id', 'name', 'locations:locations', 'tags', 'isGb']
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
    , 'eliteVisitsRequired'
    ]
  , create: []
  , update: []
  }

, default: {}

, ownerManager: {
    update: ['reward', 'requiredItem', 'regularPunchesRequired', 'elitePunchesRequired', 'eliteVisitsRequired']
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