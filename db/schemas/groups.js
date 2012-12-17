
/**
 * Groups Sql definition
 */

var
  sql = require('sql')
;

module.exports = sql.define({
  name: 'groups'
, columns: [
    'id'
  , 'name'
  ]
});