var appConfig = require('../config');
var config = {
  mongoConnStr:     "mongodb://localhost/goodybag"
, postgresConnStr:  appConfig.postgresConnStr //"postgres://localhost:5432/goodybag"
, schemaFiles: [
    'sessions'
  , 'charities'
  , 'businesses'
  , 'locations'
  , 'users'
  , 'consumers'
  , 'managers'
  , 'cashiers'
  , 'tapinStations'
  , 'groups'
  , 'usersGroups'
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
};

module.exports = config;
