/**
 * Module dependencies
 */

var
    sql = require('sql')
    ;

module.exports = sql.define({
    name: 'groups'
    , columns: [
        'id'
        , 'group'
        , 'createdAt'
        , 'updatedAt'

    ]
});