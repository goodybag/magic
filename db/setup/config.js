module.exports = {
  mongoConnStr:     "mongodb://localhost/goodybag"
, postgresConnStr:  "postgres://localhost:5432/goodybag"
, schemaFiles: [
    'businesses'
  , 'locations'
  ]
, fixtureFile: 'test'
};