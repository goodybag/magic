var all = [
  'id'
, 'name'
, 'description'
, 'businessId'
, 'isFeatured'
, 'order'
, 'categories'
];

module.exports = {
  world: {
    read:   ['id', 'name', 'description', 'businessId']
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
, businessManager: {
    read:   true
  , create: true
  , update: true
  }
};
