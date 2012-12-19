
/**
 * Photos
 */

var
  sql = require('sql')
;

module.exports = sql.define({
  name: 'photos'
, columns: [
    'id'
  , 'businessId'
  , 'productId'
  , 'consumerId'
  , 'url'
  , 'notes'
  , 'lat'
  , 'lon'
  , 'isEnabled'
  , 'createdAt'
  ]
});