
/*
 * GET users listing.
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}

  // Tables
, businesses = db.tables.businesses
, locations  = db.tables.locations
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * List businesses
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-businesses', req.uuid];
  logger.routes.debug(TAGS, 'fetching list of businesses', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = businesses.select.apply(
      businesses
    , req.fields
    ).from(
      businesses
    ).toQuery();

    client.query(query.text, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows });
    });
  });
};


/**
 * List businesses with the locations as an array
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.listWithLocations = function(req, res){
  var TAGS = ['list-businesses-with-locations', req.uuid];

  logger.routes.debug(TAGS, 'fetching list of businesses', {uid: 'more'});

  db.getClient(function(error, client){
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    var bFields = [
      'id'
    , 'name'
    , 'street1'
    , 'street2'
    , 'city'
    , 'state'
    , 'zip'
    , 'enabled'
    , 'cardCode'
    ], lFields = [
      'id'
    , 'name'
    , 'street1'
    , 'street2'
    , 'city'
    , 'state'
    , 'zip'
    , 'country'
    , 'phone'
    , 'fax'
    , 'lat'
    , 'lng'
    ];

    query = {
      text: 'select '
            + bFields.map(function(a){ return "\"b\".\"" + a + "\""; }).join(", ")
            + ', '
            + lFields.map(function(a){ return "\"l\".\"" + a + "\" as \"location_" + a + "\""; }).join(", ")
            + ' from businesses as b'
            + ' inner join locations as l'
            + ' on ("b"."id" = "l"."businessId")'
            + ' order by id desc'
    };

    logger.db.debug(TAGS, query.text);

    client.query(query.text, function(error, results){
      if (error){
        logger.routes.error(TAGS, error);
        return res.json({ error: error, data: null });
      }

      var
        bindex = {}
      , set = []
      , getLocFromResult = function(result){
          return {
            id:       result.location_id
          , name:     result.location_name
          , street1:  result.location_street1
          , street2:  result.location_street2
          , city:     result.location_city
          , state:    result.location_state
          , zip:      result.location_zip
          , country:  result.location_country
          , phone:    result.location_phone
          , fax:      result.location_fax
          , lat:      result.location_lat
          , lng:      result.location_lng
          };
        }
      , getBizFromResult = function(result){
          var biz = {};
          for (var i = bFields.length - 1; i >= 0; i--){
            biz[bFields[i]] = result[bFields[i]];
          }
          biz.locations = [];
          return biz;
        }
      ;
      // Massage data
      for (var i = 0, result, loc, biz; i < results.rows.length; i++){
        result = results.rows[i];
        biz = getBizFromResult(result);
        loc = getLocFromResult(result);
        if (bindex.hasOwnProperty(result.id)){
          set[bindex[result.id]].locations.push(loc);
        }else{
          biz.locations.push(loc);
          bindex[biz.id] = set.push(biz) - 1;
        }
      }

      logger.db.debug(TAGS, results);

      return res.json({ error: null, data: set });
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
