
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
  , 'businessId'
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