
/**
 * Product Tags
 */

var
  sql = require('sql')
;

module.exports = sql.define({
  name: 'productTags'
, columns: [
    'id'
  , 'businessId'
  , 'productId'
  , 'tag'
  , 'createdAt'
  ]
});