
/**
 * Users Sql definition
 */

var
  sql = require('sql')
;

module.exports = sql.define({
  name: 'users'
, columns: [
    'id'
  , 'email'
  , 'password'
  , 'singlyAccessToken'
  , 'singlyId'
  ]
});