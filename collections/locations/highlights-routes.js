/*
 * Location resources
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, async   = require('async')
, sql     = require('../../lib/sql')
, errors  = require('../../lib/errors')
, magic   = require('../../lib/magic')

, logger  = {}

, schemas = db.schemas
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

module.exports.list = function(req, res){
  var TAGS = ['get-highlights', req.uuid];
  logger.routes.debug(TAGS, 'fetching location highlights');

  var includes = [].concat(req.query.include);

  var joins = [];

  var query = sql.query([
    'select {fields} from "highlights"'
  , '  {joins}'
  , '  {where}'
  , '  {group} {order} {offset} {limit}'
  ]);

  // only add locationId if we're not querying by highlightId
  if (
    req.param('locationId') &&
    !req.param('highlightId')
  ) query.$('locationId', req.param('locationId'));

  if (req.param('highlightId')) query.$('highlightId', req.param('highlightId'));

  // Where what what
  query.where = sql.where();

  // Add dem' fields
  query.fields = sql.fields()
    .add(db.fields.highlights.withTable)
    .add('COUNT(*) OVER() as "metaTotal"');

  // Is single?
  if (req.param('highlightId')){
    query.where.and('"highlights"."id" = $highlightId');

  // Else we need some location/business joins to get bizId
  } else {
    joins.push('left join "locations" on "locations"."id" = $locationId');
    joins.push('left join "businesses" on "locations"."businessId" = "businesses"."id"');

    query.where.and('"highlights"."businessId" = "businesses"."id"');
  }

  // Offset limit
  if (req.param('offset')) query.offset = 'offset ' + req.param('offset');
  if (req.param('limit'))  query.limit  = 'limit ' + req.param('limit');

  // Group by
  query.group = 'group by "highlights".id';

  // Order
  query.order = 'order by "highlights".order asc';

  // Include Products
  if (includes.indexOf('products') > -1){
    // Join to get highlight->Product relation
    joins.push([
      'left outer join "highlightsProducts"'
    , '  on "highlights".id = "highlightsProducts"."highlightId"'
    ].join('\n'));

    // Embed the product record into each highlight records
    query.fields.add('array_to_json( array_agg( prods.product ) ) as products');

    // Sub-query to get products as an ordered JSON array
    joins.push([
      'left join ( select'
    , '  p.id'
    , ', row_to_json(p) as product'
    , ', "highlightsProducts".order as order'
    , 'from products p'
    , '  left join "highlightsProducts"'
    , '    on "highlightsProducts"."productId" = p.id'
    , 'order by "highlightsProducts".order asc'
    , ') prods on prods.id = "highlightsProducts"."productId"'
    ].join('\n'));
  }

  if (joins.length > 0) query.joins = joins.join('\n')

  db.query(query, function(error, results, result){
    if (error)
      return res.error(errors.internal.DB_FAILURE, error),
        logger.routes.error(TAGS, error);

    if (result.rowCount == 0){
      if (req.param('highlightId'))
        return res.status(404).end();
      else
        return res.json({ error: null, data: [], meta: { total: 0 } });
    }

    res.json({
      error: null
    , data: req.param('highlightId') ? results[0] : results
    , meta: { total: results[0].metaTotal }
    });
  });
};

module.exports.create = function(req, res){
  var TAGS = ['create-highlight', req.uuid];

  db.api.highlights.setLogTags(TAGS);

  var products;
  if (products = req.body.products) delete req.body.products;

  // isEnabled = true by default
  if (req.body.isEnabled == null || req.body.isEnabled == undefined)
    req.body.isEnabled = true;

  db.api.highlights.insert(req.body, function(error, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    (function(next){
      if (!products) return next();

      // Insert each highlightsProducts record
      var fns = [], msp;
      for (var i = 0, l = products.length; i < l; ++i){
        msp = {
          highlightId:  result[0].id
        , locationId: req.param('locationId')
        , productId:  products[i].id
        , order:      products[i].order
        };

        fns.push(function(done){
          db.api.highlightsProducts.insert(msp, function(error, results, result){
            done(error, results);
          });
        });

        async.parallel(fns, next);
      }
    })(function(error){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      res.json({ error: null, data: result.length > 0 ? result[0] : null });
    });
  });
};

module.exports.update = function(req, res){
  var TAGS = ['update-highlight', req.uuid];

  db.api.highlights.setLogTags(TAGS);

  if (req.body.id) delete req.body.id;


  db.api.highlights.update(req.param('highlightId'), req.body, function(error, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    res.noContent();
  });
};

module.exports.remove = function(req, res){
  var TAGS = ['remove-highlight', req.uuid];

  db.api.highlights.setLogTags(TAGS);

  db.api.highlights.remove(req.param('highlightId'), function(error, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    res.noContent();
  });
};

module.exports.addItem = function(req, res){
  var TAGS = ['update-highlight', req.uuid];

  db.api.highlightsProducts.setLogTags(TAGS);

  var item = {
    locationId: req.param('locationId')
  , highlightId:  req.param('highlightId')
  , productId:  req.body.productId
  , order:      req.body.order
  };

  db.api.highlightsProducts.insert(item, function(error, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    res.json({ error: null, data: result[0] });
  });
};