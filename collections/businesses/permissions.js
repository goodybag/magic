module.exports = {
  world: {
    read:   ['id', 'name', 'locations:locations']
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