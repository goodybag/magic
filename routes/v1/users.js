/*
 * Users resources
 */

var
    db      = require('../../db')
    , utils   = require('../../lib/utils')
    , errors  = require('../../lib/errors')
    , crypto    = require('crypto')

    , logger  = {}

// Tables
    , users  = db.tables.users
    ;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * Insert Users
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */

module.exports.create = function(req, res){
    var TAGS = ['create-user', req.uuid];if (error){
        logger.routes.error(TAGS, error);
        return res.json({ error: error, data: null });
    }

   utils.encryptPassword(req.param("password"), function (password) {

        var query = users.insert({
                'name': req.param("name")
           ,    'password': password}).toQuery();

           logger.db.debug(TAGS, query.text);

           client.query(query.text + 'RETURNING id', query.values, function(error, result){
               if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

               logger.db.debug(TAGS, result);

               return res.json({ error: null, data: result.rows[0] });
           });
       });

    db.getClient(function(error, client){
        if (error){
            logger.routes.error(TAGS, error);
            return res.json({ error: error, data: null });
        }


    });
}


