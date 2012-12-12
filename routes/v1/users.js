var
    db      = require('../../db')
    , utils   = require('../../utils')
    , errors  = require('../../errors')

    , logger  = {}

// Tables
    , users = db.tables.user;

// Setup loggers
logger.routes = require('../../logger')({app: 'api', component: 'routes'});
logger.db = require('../../logger')({app: 'api', component: 'db'});


module.exports.list = function(req, res){


};


