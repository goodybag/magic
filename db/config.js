var appConfig = require('../config');
module.exports = {
  mongoConnStr:     "mongodb://localhost/goodybag"
, postgresConnStr:  appConfig.postgresConnStr //"postgres://localhost:5432/goodybag"
, schemaFiles: [
    'sessions'
  , 'businesses'
  , 'locations'
  , 'users'
  , 'consumers'
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
  , 'oddity'
  , 'oddityMeta'
  ]
, fixtureFile: 'test'
, oddityFile: 'oddityTest'
};