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
, 'order'       // used on the menu
, 'locations'
, 'locations.locationId'
, 'locations.productId'
, 'locations.inSpotlight'
, 'locations.inGallery'
, 'locations.spotlightOrder'
, 'locations.galleryOrder'
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
    , 'order'
    , 'locations'
    , 'locations.locationId'
, 'locations.productId'
    , 'locations.inSpotlight'
    , 'locations.inGallery'
    , 'locations.spotlightOrder'
    , 'locations.galleryOrder'
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
, manager: {
    read: true
  , create: true
  , update: true
  }
};
