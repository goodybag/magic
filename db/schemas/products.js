
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
  , 'enabled'
  ]
});