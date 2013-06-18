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
  var TAGS = ['get-menu-sections', req.uuid];
  logger.routes.debug(TAGS, 'fetching location menu');

  var includes = [].concat(req.query.include);

  var joins = [];

  var query = sql.query([
    'select {fields} from "menuSections"'
  , '  {joins}'
  , '  {where}'
  , '  {group} {order} {offset} {limit}'
  ]);

  // only add locationId if we're not querying by sectionId
  if (
    req.param('locationId') &&
    !req.param('sectionId')
  ) query.$('locationId', req.param('locationId'));

  if (req.param('sectionId')) query.$('sectionId', req.param('sectionId'));

  // Where what what
  query.where = sql.where();

  // Add dem' fields
  query.fields = sql.fields()
    .add(db.fields.menuSections.withTable)
    .add('COUNT(*) OVER() as "metaTotal"');

  // Is single?
  if (req.param('sectionId')){
    query.where.and('"menuSections"."id" = $sectionId');

  // Else we need some location/business joins to get bizId
  } else {
    joins.push('left join "locations" on "locations"."id" = $locationId');
    joins.push('left join "businesses" on "locations"."businessId" = "businesses"."id"');

    query.where.and('"menuSections"."businessId" = "businesses"."id"');
  }

  // Offset limit
  if (req.param('offset')) query.offset = 'offset ' + req.param('offset');
  if (req.param('limit'))  query.limit  = 'limit ' + req.param('limit');

  // Group by
  query.group = 'group by "menuSections".id';

  // Order
  query.order = 'order by "menuSections".order asc';

  // Include Products
  if (includes.indexOf('products') > -1){
    // Join to get menuSection->Product relation
    joins.push([
      'left outer join "menuSectionsProducts"'
    , '  on "menuSections".id = "menuSectionsProducts"."sectionId"'
    ].join('\n'));

    // Embed the product record into each section records
    query.fields.add('array_to_json( array_agg( prods.product ) ) as products');

    // Sub-query to get products as an ordered JSON array
    joins.push([
      'left join ( select'
    , '  p.id'
    , ', row_to_json(p) as product'
    , ', "menuSectionsProducts".order as order'
    , 'from products p'
    , '  left join "menuSectionsProducts"'
    , '    on "menuSectionsProducts"."productId" = p.id'
    , 'order by "menuSectionsProducts".order asc'
    , ') prods on prods.id = "menuSectionsProducts"."productId"'
    ].join('\n'));
  }

  if (joins.length > 0) query.joins = joins.join('\n')

  db.query(query, function(error, results, result){
    if (error)
      return res.error(errors.internal.DB_FAILURE, error),
        logger.routes.error(TAGS, error);

    if (result.rowCount == 0){
      if (req.param('sectionId'))
        return res.status(404).end();
      else
        return res.json({ error: null, data: [], meta: { total: 0 } });
    }

    res.json({
      error: null
    , data: req.param('sectionId') ? results[0] : results
    , meta: { total: results[0].metaTotal }
    });
  });
};

module.exports.create = function(req, res){
  var TAGS = ['create-menu-sections', req.uuid];

  db.api.menuSections.setLogTags(TAGS);

  var products;
  if (products = req.body.products) delete req.body.products;

  // isEnabled = true by default
  if (req.body.isEnabled == null || req.body.isEnabled == undefined)
    req.body.isEnabled = true;

  db.api.menuSections.insert(req.body, function(error, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    (function(next){
      if (!products) return next();

      // Insert each menuSectionsProducts record
      var fns = [], msp;
      for (var i = 0, l = products.length; i < l; ++i){
        msp = {
          sectionId:  result[0].id
        , locationId: req.param('locationId')
        , productId:  products[i].id
        , order:      products[i].order
        };

        fns.push(function(done){
          db.api.menuSectionsProducts.insert(msp, function(error, results, result){
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
  var TAGS = ['update-menu-section', req.uuid];

  db.api.menuSections.setLogTags(TAGS);

  if (req.body.id) delete req.body.id;


  db.api.menuSections.update(req.param('sectionId'), req.body, function(error, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    res.noContent();
  });
};

module.exports.remove = function(req, res){
  var TAGS = ['remove-menu-section', req.uuid];

  db.api.menuSections.setLogTags(TAGS);

  db.api.menuSections.remove(req.param('sectionId'), function(error, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    res.noContent();
  });
};

module.exports.addItem = function(req, res){
  var TAGS = ['update-menu-section', req.uuid];

  db.api.menuSectionsProducts.setLogTags(TAGS);

  var item = {
    locationId: req.param('locationId')
  , sectionId:  req.param('sectionId')
  , productId:  req.body.productId
  , order:      req.body.order
  };

  db.api.menuSectionsProducts.insert(item, function(error, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    res.json({ error: null, data: result[0] });
  });
};