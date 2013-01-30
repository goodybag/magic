var all = [
  'id'
, 'tag'
];

module.exports = {
  world: {
    read:   all
  , create: []
  , update: []
  }

, default: {}

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