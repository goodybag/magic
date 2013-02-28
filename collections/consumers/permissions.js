var consumerAll = [
  'id'
, 'userId'
, 'email'
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
];

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
      read: consumerAll
    , update: [
        'email'
      , 'singlyId'
      , 'singlyAccessToken'
      , 'firstName'
      , 'lastName'
      , 'screenName'
      , 'avatarUrl'
      , 'cardId'
      ]
    }

  , admin: {
      read:   consumerAll
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
  , admin: {
      read: true
    , create: true
    , update: true
    }
  }
};