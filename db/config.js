var appConfig = require('../config');
module.exports = {
  mongoConnStr:     "mongodb://localhost/goodybag"
, postgresConnStr:  appConfig.postgresConnStr //"postgres://localhost:5432/goodybag"
, schemaFiles: [
    'sessions'
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
  // oddity and oddityMeta database should be hidden after inserting into database
  //, 'oddity'
  //, 'oddityMeta'
  ]
, fixtureFile: 'test'
//, oddityFile: 'postgresOddity'
};