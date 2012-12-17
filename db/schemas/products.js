
/**
 * Products
 */

var
  sql = require('sql')
;

module.exports = sql.define({
  name: 'products'
, columns: [
    'id'
  , 'businessId'
  , 'name'
  , 'description'
  , 'price'
  , 'isVerified'
  , 'isArchived'
  , 'isEnabled'
  ]
});