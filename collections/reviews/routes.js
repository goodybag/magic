/**
 * Businesses information from Oddity Database
 */

var
  db      = require('../../db')
  , utils   = require('../../lib/utils')
  , errors  = require('../../lib/errors')

  , logger  = {}

// Tables
  , oddityLive = db.tables.oddityLive
  , oddityMeta = db.tables.oddityMeta
  ;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * Get List of Oddity Business with business name and addresses
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */

module.exports.list = function(req, res){
  var TAGS = ['get-oddity-businesses list', req.uuid];
  logger.routes.debug(TAGS, 'fetching list of oddity businesses', {uid: "more"});

  // retrieve oddity business from oddityMeta join oddity table
  db.getClient(function(error, client){
    if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);


    // query of joining oddityMeta and oddity tables to return business' name and address
    var query = oddityLive.select(
        oddityMeta.id
      , oddityMeta.oddityLiveId
      , oddityLive.biz_name
      , oddityLive.e_address
      , oddityLive.e_city
      , oddityLive.web_url
      , oddityLive.e_state
      , oddityLive.e_postal
    ).from(oddityLive.join(oddityMeta).on(
      oddityLive.id.equals(oddityMeta.oddityLiveId))
    ).where(oddityMeta.toReview.equals(true))
      .and(oddityMeta.changeColumns.equals(true))
      .and(oddityMeta.isHidden.equals(false)).toQuery();

    client.query(query.text, query.values, function(error, results){
      if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      return res.json({error: null, data: results.rows})
    })

  })
}
/**
 * Get 1 business by joining table between oddityLive and oddityMeta, return business name, address
 * city, postal and web url
 * @param req
 * @param res
 */
module.exports.get = function(req, res){
  var TAGS = ['get-review', req.uuid];
  logger.routes.debug(TAGS, 'getting oddityMeta by id ' + req.params.id, {uid: "more"});

  db.getClient(function(error, client){
    if(error) res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = oddityLive.select(
      oddityMeta.id
      , oddityMeta.oddityLiveId
      , oddityLive.biz_name
      , oddityLive.e_address
      , oddityLive.e_city
      , oddityLive.web_url
      , oddityLive.e_state
      , oddityLive.e_postal
    ).from(oddityLive.join(oddityMeta).on(
      oddityLive.id.equals(oddityMeta.oddityLiveId))
    ).where(oddityMeta.toReview.equals(true))
      .and(oddityMeta.changeColumns.equals(true))
      .and(oddityMeta.isHidden.equals(false)
      .and(oddityMeta.id.equals(+req.params.id || 0))).toQuery();

    client.query(query.text, query.values, function(error, result){
      if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (result.rowCount === 0) {
        return res.status(404).end();
      }
      return res.json({error: null, data: result.rows[0]})
    })
  })
  //query to get review by id

}
/**
 * Function to hide one business in oddityMeta table and isHidden is set to false
 * @param req
 * @param res
 */
module.exports.hide = function(req, res){
  var TAGS = ['hide-review', req.uuid];
  logger.routes.debug(TAGS, 'hide business from to review ' + req.params.id, {uid: "more"});

  db.getClient(function(error, client){
    if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

  var query = oddityMeta.update({isHidden: true}).where
  (oddityMeta.oddityLiveId.equals(req.params.id)).toQuery();

    logger.db.debug(TAGS, query.text);
    client.query(query.text, query.values, function(error, result){
      if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);


      return res.json({error: null, data: null });
    })
  })
}