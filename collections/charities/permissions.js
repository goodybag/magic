module.exports = {
  world: {
    read:   ['id', 'name', 'desc', 'logoUrl']
  , create: []
  , update: []
  }

, default: {}

, owner: {
    read:   ['joinDate', 'totalReceived']
  }

, sales: {
    read:   true
  , create: ['name', 'desc', 'logoUrl']
  , update: ['name', 'desc', 'logoUrl']
  }

, admin: {
    read:   true
  , create: true
  , update: true
  }
};