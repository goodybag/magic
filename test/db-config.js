module.exports = {
  mongoConnStr:     "mongodb://localhost/goodybag-test"
, postgresConnStr:  "postgres://localhost:5432/goodybag-test"
, schemaFiles: [
    'businesses'
  , 'locations'

  ]
, fixtureFile: 'test'
};