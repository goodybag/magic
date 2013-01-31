var all = [
  'userId'
, 'email'
, 'password'
, 'singlyId'
, 'singlyAccessToken'
, 'managerId'
, 'businessId'
, 'locationId'
, 'cardId'
];

module.exports = {
  world: {
    read:   []
  , create: []
  , update: []
  }

, default: {}

, owner: {
    read:   true
  , update: all
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