module.exports = {
  world: {
    read:   []
  , create: []
  , update: []
  }

, default: {}

, owner: {
    read:   true
  , update: ['email', 'password', 'singlyId', 'singlyAccessToken']
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