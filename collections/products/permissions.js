var all = [
  'id'
, 'businessId'
, 'businessName'
, 'businessIsGB'
, 'name'
, 'description'
, 'price'
, 'photoUrl'
, 'photos:photos'
, 'likes'
, 'wants'
, 'tries'
, 'isVerified'
, 'isArchived'
, 'isEnabled'
, 'categories:productCategories'
, 'tags:productTags'
, 'isAvailable'
, 'collections'
, 'inSpotlight'
, 'userLikes'
, 'userWants'
, 'userTried'
];

module.exports = {
  world: {
    read:   [
      'id'
    , 'businessId'
    , 'businessName'
    , 'businessIsGB'
    , 'name'
    , 'description'
    , 'distance'
    , 'price'
    , 'photoUrl'
    , 'photos:photos'
    , 'likes'
    , 'wants'
    , 'tries'
    , 'categories:productCategories'
    , 'tags:productTags'
    , 'isAvailable'
    , 'collections'
    , 'inSpotlight'
    , 'userLikes'
    , 'userWants'
    , 'userTried'
    ]
  , create: []
  , update: []
  }

, default: {}

, consumer: {
    create: ['businessId', 'name', 'description', 'price', 'categories', 'tags']
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