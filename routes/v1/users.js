var
    db      = require('../../db')
    , utils   = require('../../utils')
    , errors  = require('../../errors')

    , logger  = {}

// Tables
    , users = db.tables.users
    , groups= db.tables.groups
    , usergroup=db.tables.usergroup;

// Setup loggers
logger.routes = require('../../logger')({app: 'api', component: 'routes'});
logger.db = require('../../logger')({app: 'api', component: 'db'});




module.export.create = function(req, res){


};

