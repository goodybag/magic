var appConfig = require('../config');
var config = {
  mongoConnStr:     "mongodb://localhost/goodybag"
, postgresConnStr:  appConfig.postgresConnStr //"postgres://localhost:5432/goodybag"
, schemaFiles: [
    'sessions'

  , 'charities'

  , 'businesses'
  , 'businessLoyaltySettings'
  , 'businessTags'
  , 'businessRequests'
  , 'businessContactRequests'
  , 'locations'

  , 'users'
  , 'consumers'
  , 'managers'
  , 'cashiers'
  , 'tapinStations'
  , 'groups'
  , 'usersGroups'
  , 'userLoyaltyStats'
  , 'userRedemptions'
  , 'userPasswordResets'
  , 'consumerCardUpdates'
  , 'pendingFacebookUsers'

  , 'tapins'
  , 'visits'

  , 'products'
  , 'productCategories'
  , 'productsProductCategories'
  , 'productLocations'
  , 'productTags'
  , 'productsProductTags'
  , 'productLikes'
  , 'productWants'
  , 'productTries'

  , 'photos'

  , 'collections'
  , 'productsCollections'

  , 'oddityLive'
  , 'oddityMeta'

  , 'events'
  , 'activity'

  , 'poplistItems'
  ]
, fixtureFile: 'test'
};

module.exports = config;
