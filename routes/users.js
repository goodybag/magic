
/*
 * GET users listing.
 */

var
  logger = {}
;

//Setup loggers
logger.routes = require('../logger')({app: 'api', component: 'routes'});
logger.db = require('../logger')({app: 'api', component: 'db'});

exports.list = function(req, res){
  var TAGS = ['user-list', req.uuid];

  logger.routes.debug(TAGS, 'testing', {uid: 'more'});
  logger.db.debug(TAGS, 'db is ok');

  res.send("respond with a resource");
};