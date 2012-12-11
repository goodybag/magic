
/*
 * GET users listing.
 */

var
  db      = require('../../db')
, utils   = require('../../utils')
, errors  = require('../../errors')

, logger  = {}

  // Tables
, businesses = db.tables.businesses
;

// Setup loggers
logger.routes = require('../../logger')({app: 'api', component: 'routes'});
logger.db = require('../../logger')({app: 'api', component: 'db'});


/**
 * List businesses
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.list = function(req, res){
  var TAGS = ['list-businesses', req.uuid];

  logger.routes.debug(TAGS, 'fetching list of businesses', {uid: 'more'});

  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    var query = businesses.select(
      businesses.id
    , businesses.name
    , businesses.street1
    , businesses.street2
    , businesses.city
    , businesses.state
    , businesses.zip
    , businesses.enabled
    ).from(businesses).toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text, function(error, results){
      if (error){
        logger.routes.error(TAGS, error);
        return res.json({ error: error, data: null });
      }

      logger.db.debug(TAGS, results);

      return res.json({ error: null, data: results.rows });
    });
  });
};

/**
 * Insert business
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.save = function(req, res){
  var TAGS = ['save-business', req.uuid];

  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    var query = businesses.select(
      businesses.id
    , businesses.name
    , businesses.street1
    , businesses.street2
    , businesses.city
    , businesses.state
    , businesses.zip
    , businesses.enabled
    ).from(businesses).toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query, function(error, results){
      if (error){
        logger.routes.error(TAGS, error);
        return res.json({ error: error, data: null });
      }

      logger.db.debug(TAGS, results);

      return res.json({ error: null, data: results.rows });
    });
  });
};
