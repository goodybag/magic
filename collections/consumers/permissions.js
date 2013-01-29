module.exports = {
  world: {
    read:   []
  , create: [
      'email'
    , 'password'
    , 'singlyId'
    , 'singlyAccessToken'
    , 'firstName'
    , 'lastName'
    , 'screenName'
    , 'cardId'
    ]
  , update: []
  }

, default: {}

, owner: {
    read:   true
  , update: [
      'email'
    , 'password'
    , 'singlyId'
    , 'singlyAccessToken'
    , 'firstName'
    , 'lastName'
    , 'screenName'
    , 'cardId'
    ]
  }

, admin: {
    read:   true
  , create: true
  , update: true
  }
};