module.exports = {
  mongoConnStr:     "mongodb://localhost/goodybag-test" // DO NOT allow this to be set to a production or staging server, as our tests would then wipe them out!!!
, postgresConnStr:  "postgres://localhost:5432/goodybag-test"
, fixtureFile: 'test'
};