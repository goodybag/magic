var appConfig = require('../config');
var config = {
  mongoConnStr:     "mongodb://localhost/goodybag"
, postgresConnStr:  appConfig.postgresConnStr //"postgres://localhost:5432/goodybag"
, schemaFiles: [
    'sessions'
  , 'charities'
  , 'businesses'
  , 'businessLoyaltySettings'
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
  , 'products'
  , 'productCategories'
  , 'productsProductCategories'
  , 'productLocations'
  , 'photos'
  , 'productTags'
  , 'productsProductTags'
  , 'productLikes'
  , 'productWants'
  , 'productTries'
  , 'oddityLive'
  , 'oddityMeta'
  ]
, fixtureFile: 'test'
, oddityFile: 'oddityTest'
};

module.exports = config;