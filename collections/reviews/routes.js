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
    if(error) return res.json({error: error, data: null }), logger.routes.error(TAGS, error);


    // query of joining oddityMeta and oddity tables to return business' name and address
    var query = oddityLive.select(
      oddityLive.biz_name
      , oddityLive.id
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
      if(error) return res.json({error: error, data: null}), logger.routes.error(TAGS, error);

      return res.json({error: null, data: results.rows})
    })

  })
}

module.exports.get = function(req, res){
  var TAGS = ['get-review', req.uuid];
  logger.routes.debug(TAGS, 'deleting business ' + req.params.id, {uid: "more"});

  db.getClient(function(error, client){
    if(error) return res.json({error: error, data: null}), logger.routes.error(TAGS, error);

    var query = oddityLive.select(
      oddityLive.biz_name
      , oddityLive.id
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
      .and(oddityLive.id.equals(+req.params.id))).toQuery();

    client.query(query.text, query.values, function(error, results){
      if(error) return res.json({error: error, data: null}), logger.routes.error(TAGS, error);

      return res.json({error: null, data: results.rows})
    })
  })
  //query to get review by id

}