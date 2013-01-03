var appConfig = require('../config');
module.exports = {
  mongoConnStr:     "mongodb://localhost/goodybag"
, postgresConnStr:  appConfig.postgresConnStr //"postgres://localhost:5432/goodybag"
, schemaFiles: [
    'businesses'
  , 'locations'
  , 'users'
  , 'groups'
  , 'userGroups'
  , 'products'
  , 'productCategories'
  , 'productsProductCategories'
  , 'photos'
  , 'productTags'
  ]
, fixtureFile: 'test'
};