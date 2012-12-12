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
        , 'enable'
        , 'createdAt'
        , 'updatedAt'

    ]
});