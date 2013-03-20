var all = [
  'id'
, 'email'
, 'singlyId'
, 'singlyAccessToken'
, 'groups'
, 'groups.id'
, 'groups.name'
, 'groupIds'
, 'cardId'
, 'createdAt'
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