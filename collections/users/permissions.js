var all = [
  'id'
, 'email'
, 'singlyUserId'
, 'singlyAccessToken'
, 'groups'
, 'groups.id'
, 'groups.name'
, 'groupIds'
, 'cardId'
];

module.exports = {
  world: {
    read:   ['id']
  , create: []
  , update: []
  }

, default: {}

, owner: {
    read:   all
  , update: ['email', 'singlyAccessToken', 'password']
  }

, sales: {
    read:   all
  , create: all
  , update: all
  }

, admin: {
    read:   all
  , create: all.concat('password')
  , update: all.concat('password')
  }
};