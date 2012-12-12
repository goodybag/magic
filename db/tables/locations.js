
/**
 * Locations
 */

var
  sql = require('sql')
;

module.exports = sql.define({
  name: 'locations'
, columns: [
    'id'
  , 'businessid'
  , 'name'
  , 'street1'
  , 'street2'
  , 'city'
  , 'state'
  , 'zip'
  , 'country'
  , 'phone'
  , 'fax'
  , 'lat'
  , 'lng'
  ]
});