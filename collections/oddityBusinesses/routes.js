/**
 * Businesses information from Oddity Database
 */

var
  db      = require('../../db')
  , utils   = require('../../lib/utils')
  , errors  = require('../../lib/errors')

  , logger  = {}

// Tables
  , oddity = db.tables.oddity
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
  db.getClient((function(error, client){
    if(error) return res.json({error: error, data: null }), logger.routes.error(TAGS, error);


    // query of joining oddityMeta and oddity tables to return business' name and address
    var query = oddity.select(
      oddity.biz_name
    , oddity.e_address
    , oddity.e_city
    , oddity.web_url
    , oddity.e_state
    , oddity.e_postal
    ).from(oddity.join(oddityMeta).on(
      oddity.id.equals(oddityMeta.oddityId))
    ).where(oddityMeta.toReview.equals(true))
      .and(oddityMeta.changeColumns.equals(true))
      .and(oddityMeta.isHidden.equals(false)).toQuery();

    client.query(query.text, query.values, function(error, results){
      if(error) return res.json({error: error, data: null}), logger.routes.error(TAGS, error);

      return res.json({error: null, data: results.rows})
    })

  }))
}