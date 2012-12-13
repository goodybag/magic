/*
 * GET users listing.
 */

var
    db = require('../../db')
    , utils = require('../../lib/utils')
    , errors = require('../../lib/errors')
    , schemas = require('../../schemas/routes')

    , logger = {}

// Tables
    , users = db.tables.users
    , usergroup = db.tables.groups
    ;

// Setup loggers
logger.routes = require('../../lib/logger')({app:'api', component:'routes'});
logger.db = require('../../lib/logger')({app:'api', component:'db'});

/**
 * Insert New Users
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */

module.exports.create = function (req, res) {
    var TAGS = ['create-user', req.uuid];

    console.log("get client")
    db.getClient(function (error, client) {
        if (error) return res.json({ error:error, data:null }), logger.routes.error(TAGS, error);

        utils.validate(req.body, schemas.users.model, function (error) {
            if (error) return res.json({ error:error, data:null }), logger.routes.error(TAGS, error);

            utils.encryptPassword(req.param("password"), function (password) {

                var query = users.insert({
                        'username':req.param("username")
                        , 'password':password
                        , 'singlyAccessToken': req.param("singlyAccessToken")
                        , 'singlyId': req.param("singlyId")
                        }
                ).toQuery();

                logger.db.debug(TAGS, query.text);

                client.query(query.text + 'RETURNING id', query.values, function (error, result) {
                    if (error) return res.json({ error:error, data:null }), logger.routes.error(TAGS, error);

                    logger.db.debug(TAGS, result);

                    return res.json({ error:null, data:result.rows[0] });
                });
            });

        });
    });

}

/**
 * Get users
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */

module.exports.list = function (req, res) {
    console.log("get clients");
    var TAGS = ['list-users', req.uuid];
    logger.routes.debug(TAGS, 'fetching list of users'+ req.params.id, {uid:'more'});

    db.getClient(function (error, client) {
        if (error) return res.json({ error:error, data:null }), logger.routes.error(TAGS, error);

        var query = users.select.apply(
            users
            , req.fields
        ).from(
            users
        ).toQuery();

        client.query(query.text, function (error, result) {
            if (error) return res.json({ error:error, data:null }), logger.routes.error(TAGS, error);

            logger.db.debug(TAGS, result);

            return res.json({ error:null, data:result.rows });
        });
    });
};




