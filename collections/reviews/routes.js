/**
 * Businesses information from Oddity Database
 */

var
  db      = require('../../db')
  , utils   = require('../../lib/utils')
  , errors  = require('../../lib/errors')
  , sql     = require('../../lib/sql')

  , logger  = {}
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

  db.getClient(TAGS[0], function(error, client){
    if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'SELECT * FROM "oddityLive"',
        'INNER JOIN "oddityMeta"',
          'ON "oddityMeta"."oddityLiveId" = "oddityLive".id',
        'WHERE "oddityMeta"."toReview" = true',
          'AND "oddityMeta"."changeColumns" = true',
          'AND "oddityMeta"."isHidden" = false'
    ]);

    client.query(query.toString(), query.$values, function(error, results){
      if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      return res.json({error: null, data: results.rows})
    });
  });
};

/**
 * Get 1 business by joining table between oddityLive and oddityMeta, return business name, address
 * city, postal and web url
 * @param req
 * @param res
 */
module.exports.get = function(req, res){
  var TAGS = ['get-review', req.uuid];
  logger.routes.debug(TAGS, 'getting oddityMeta by id ' + req.params.id, {uid: "more"});

  db.getClient(TAGS[0], function(error, client){
    if(error) res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'SELECT * FROM "oddityLive"',
        'INNER JOIN "oddityMeta"',
          'ON "oddityMeta"."oddityLiveId" = "oddityLive".id',
        'WHERE "oddityMeta"."toReview" = true',
          'AND "oddityMeta"."changeColumns" = true',
          'AND "oddityMeta"."isHidden" = false',
          'AND "oddityMeta".id = $id'
    ]);
    query.$('id', +req.params.id || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (result.rowCount === 0) return res.status(404).end();
      return res.json({error: null, data: result.rows[0]})
    });
  });
};
/**
 * Function to hide one business in oddityMeta table and isHidden is set to false
 * @param req
 * @param res
 */
module.exports.update = function(req, res){
  var TAGS = ['hide-review', req.uuid];
  logger.routes.debug(TAGS, 'hide business from to review ' + req.params.id, {uid: "more"});

  db.getClient(TAGS[0], function(error, client){
    if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
    var inputs = {
      businessId: req.body.businessId
    , locationId: req.body.locationId
    , toReview :  req.body.toReview
    , isHidden :  req.body.isHidden
    };

    var query = sql.query('UPDATE "oddityMeta" SET {updates} WHERE id=$id');
    query.updates = sql.fields().addUpdateMap(inputs, query);
    query.updates.add('"lastUpdated" = now()');
    query.$('id', +req.params.id || 0);

    logger.db.debug(TAGS, query.toString());

    client.query(query.toString(), query.$values, function(error, result){
      if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({error: null, data: null });
    });
  });
};