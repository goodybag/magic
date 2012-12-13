/**
 * Group Users
 */

var
    sql = require('sql')
    ;

module.exports = sql.define({
    name:'group-user', columns:[
        'id'
        , 'groupId'
        , 'userId'
    ]
});