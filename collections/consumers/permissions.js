module.exports = {
  consumer: {
    world: {
      read:   [
        'screenName'
      , 'userId'
      , 'avatarUrl'
      ]
    , create: [
        'email'
      , 'password'
      , 'singlyId'
      , 'singlyAccessToken'
      , 'firstName'
      , 'lastName'
      , 'screenName'
      , 'avatarUrl'
      , 'cardId'
      ]
    , update: []
    }

  , default: {}

  , owner: {
      read:   [
        'email'
      , 'singlyId'
      , 'singlyAccessToken'
      , 'userId'
      , 'firstName'
      , 'lastName'
      , 'screenName'
      , 'avatarUrl'
      , 'cardId'
      , 'groups'
      , 'groupIds'
      , 'email'
      , 'singlyAccessToken'
      , 'singlyId'
      , 'id'
      ]
    , update: [
        'email'
      , 'singlyId'
      , 'singlyAccessToken'
      , 'firstName'
      , 'lastName'
      , 'screenName'
      , 'avatarUrl'
      , 'cardId'
      , 'userId'
      ]
    }

  , admin: {
      read:   true
    , create: true
    , update: true
    }
  }

, consumerPassword: {
    world: {
      read:   []
    , create: []
    , update: []
    }

  , default: {}

  , owner: {
      create: true
    }

  , admin: {
      create: true
    }
  }

, collection: {
    world: {
      read:   []
    , create: []
    , update: []
    }

  , default: {}

  , consumers: {
      create: ['name']
    }

  , owner: {
      read:   true
    , create: ['name']
    , update: ['name']
    }

  , admin: {
      read:   true
    , create: true
    , update: true
    }
  }

, collectionProducts: {
    world: {
      read:   []
    , create: []
    , update: []
  }
  , default: {}
  , owner: {
      read: true
    , create: ['productId']
    }
  }
};