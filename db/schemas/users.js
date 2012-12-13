/**
 * Module dependencies
 */

var
    sql = require('sql')
    ;

module.exports = sql.define({
    name: 'users'
    , columns: [
        'id'
        , 'name'
        , 'password'
        , 'singlyAccessToken'
        , 'singlyId'
        , 'createdAt'
        , 'updatedAt'

    ]
});