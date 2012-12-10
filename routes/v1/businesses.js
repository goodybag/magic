
/*
 * GET users listing.
 */

var
  logger = {}
  db = require('../../db');
;

// Setup loggers
logger.routes = require('../../logger')({app: 'api', component: 'routes'});
logger.db = require('../../logger')({app: 'api', component: 'db'});


// Tables
var
  businesses = db.tables.businesses
;

/**
 * List businesses
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
exports.list = function(req, res){
  var TAGS = ['list-businesses', req.uuid];

  logger.routes.debug(TAGS, 'fetching list of businesses', {uid: 'more'});

  db.getClient(function(err, client){
    if(err != null){
      console.log(err);
      return res.send(500, /*errors.db.NO_CLIENT*/ 'Some error');
    }

    var statement = businesses.select(
        businesses.id
      , businesses.name
      , businesses.address1
      , businesses.city
      , businesses.state
      , businesses.zip
      , businesses.enabled
    )
    .from(businesses)
    ;

    var query = statement.toQuery();
    logger.db.debug(TAGS, query.text);

    return res.send(query);
  });
};