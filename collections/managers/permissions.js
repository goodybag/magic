var all = [
  'id'
, 'email'
, 'singlyId'
, 'singlyAccessToken'
, 'groups'
, 'cardId'
, 'locationId'
, 'businessId'
];

module.exports = {
  world: {
    read:   []
  , create: []
  , update: []
  }

, default: {}

, owner: {
    read:   all
  , update: ['email', 'password', 'singlyId', 'singlyAccessToken']
  }

, sales: {
    read:   all
  , create: all.concat('password')
  , update: all.concat('password')
  }

, admin: {
    read:   all
  , create: all.concat('password')
  , update: all.concat('password')
  }
};