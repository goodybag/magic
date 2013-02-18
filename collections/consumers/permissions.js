module.exports = {
  consumer: {
    world: {
      read:   [
        'screenName'
      , 'userId'
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
      read:   [
        'email'
      , 'singlyId'
      , 'singlyAccessToken'
      , 'userId'
      , 'firstName'
      , 'lastName'
      , 'screenName'
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
      , 'password'
      , 'singlyId'
      , 'singlyAccessToken'
      , 'firstName'
      , 'lastName'
      , 'screenName'
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

  , consumer: {
      create: ['name']
    }

  , owner: {
      read:   true
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