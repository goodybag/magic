/**
 * Routes Schemas users
 */

if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function(require){
    var users = {};

    users.model = {
        type: 'object'
        , properties: {
            email: {
                required: true
                , type: "string"
                , minLength: 3
                , pattern: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            }
            , password: {
                required: true
                , type: "string"
                , minLength: 6
            }
            , singlyAccessToken: {
                required: false
                , type: "string"
            }
            , singlyId: {
                required: false
                , type: "int"
            }
        }
    };

    // create schema
    users.create = {
        type: 'object'
        , properties: {}
    };

    for (var key in users.model.properties){
        users.create.properties[key] = users.model.properties[key];

    }
    return users;
});