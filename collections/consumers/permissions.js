module.exports = {
  world: {
    read:   [
      'screenName'
    , 'consumerId'
    ]
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
    , 'consumerId'
    ]
  }

, admin: {
    read:   true
  , create: true
  , update: true
  }
};