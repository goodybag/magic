
/**
 * User Groups Sql definition
 */

var
  sql = require('sql')
;

module.exports = sql.define({
  name: 'userGroups'
, columns: [
    'id'
  , 'userId'
  , 'groupId'
  ]
});