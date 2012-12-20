module.exports = {
  mongoConnStr:     "mongodb://localhost/goodybag"
, postgresConnStr:  "postgres://localhost:5432/goodybag"
, schemaFiles: [
    'businesses'
  , 'locations'
  , 'users'
  , 'groups'
  , 'userGroups'
  , 'products'
  , 'productCategories'
  , 'photos'
  , 'productTags'
  ]
, fixtureFile: 'test'
};