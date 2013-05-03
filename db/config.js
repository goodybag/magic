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
  , 'heartbeats'

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
  , 'nearbyGridItems'
  , 'requests'
  , 'partialRegistrations'
  ]
, fixtureFile: 'test'
};

module.exports = config;
