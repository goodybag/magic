
/**
 * Module dependencies
 */

var
  sql = require('sql')
;

module.exports = sql.define({
  name: 'buisnesses'
, columns: [
    'id'
  , 'name'
  , 'address1'
  , 'address2'
  , 'city'
  , 'state'
  , 'zip'
  , 'enabled'
  , 'createdAt'
  , 'updatedAt'
  , 'locations' // Number of locations
  ]
});