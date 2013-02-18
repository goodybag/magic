var all = [
  'id'
, 'businessId'
, 'productId'
, 'productName'
, 'userId'
, 'url'
, 'notes'
, 'lat'
, 'lon'
, 'isEnabled'
, 'createdAt'
];

module.exports = {
  world: {
    read:   ['id', 'businessId', 'productId', 'productName', 'userId', 'url']
  , create: []
  , update: []
  }

, default: {}

, consumer: {
    create: ['businessId', 'productId', 'productName', 'userId', 'url', 'notes', 'lat', 'lon']
  }

, owner: {
    read:   ['notes', 'isEnabled']
  , update: ['notes']
  }

, businessOwner: {
    update: ['isEnabled']
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