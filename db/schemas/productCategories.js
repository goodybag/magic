
/**
 * Product Categories
 */

var
  sql = require('sql')
;

module.exports = sql.define({
  name: 'productCategories'
, columns: [
    'id'
  , 'businessId'
  , 'order'
  , 'isFeatured'
  , 'name'
  ]
});