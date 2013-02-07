var all = [
  'id'
, 'businessId'
, 'businessName'
, 'name'
, 'description'
, 'price'
, 'photoUrl'
, 'likes'
, 'wants'
, 'tries'
, 'isVerified'
, 'isArchived'
, 'isEnabled'
, 'categories:productCategories'
, 'tags:productTags'
, 'isAvailable'
, 'isSpotlight'
];

module.exports = {
  world: {
    read:   [
      'id'
    , 'businessId'
    , 'businessName'
    , 'name'
    , 'description'
    , 'distance'
    , 'price'
    , 'photoUrl'
    , 'likes'
    , 'wants'
    , 'tries'
    , 'categories:productCategories'
    , 'tags:productTags'
    , 'isAvailable'
    , 'isSpotlight'
    ]
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