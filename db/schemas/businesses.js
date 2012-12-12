
/**
 * Module dependencies
 */

var
  sql = require('sql')
;

module.exports = sql.define({
  name: 'businesses'
, columns: [
    'id'
  , 'name'
  , 'url'
  , 'street1'
  , 'street2'
  , 'city'
  , 'state'
  , 'zip'
  , 'cardCode'
  , 'enabled'
  , 'createdAt'
  , 'updatedAt'
  , 'locations' // Number of locations
  ]
});