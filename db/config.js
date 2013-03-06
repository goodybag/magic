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
  ]
, fixtureFile: 'test'
};

module.exports = config;
