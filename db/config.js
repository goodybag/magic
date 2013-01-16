var appConfig = require('../config');
module.exports = {
  mongoConnStr:     "mongodb://localhost/goodybag"
, postgresConnStr:  appConfig.postgresConnStr //"postgres://localhost:5432/goodybag"
, schemaFiles: [
    'sessions'
  , 'charities'
  , 'businesses'
  , 'locations'
  , 'users'
  , 'groups'
  , 'usersGroups'
  , 'products'
  , 'productCategories'
  , 'productsProductCategories'
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