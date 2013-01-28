module.exports = {
  world: {
    read:   false
  , create: false
  , update: false
  , delete: false
  }

, default: {
    read:   ['id', 'charityId', 'name', 'url', 'logoUrl', 'menuDescription']
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
  , delete: true
  }

, admin: {
    read:   true
  , create: true
  , update: true
  , delete: true
  }
};