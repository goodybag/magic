/*
 * Product resources
 */

var
  db          = require('../../db')
, sql         = require('../../lib/sql')
, utils       = require('../../lib/utils')
, errors      = require('../../lib/errors')
, magic       = require('../../lib/magic')
, elastic     = require('../../lib/elastic-search')
, Transaction = require('pg-transaction')
, async       = require('async')
, config      = require('../../config')

, logger  = {}

, schemas    = db.schemas
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * List products
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-products', req.uuid];
  logger.routes.debug(TAGS, 'fetching list of products');

  // if sort=distance|nearby, validate that we got lat/lon
  if (req.query.sort && /distance/.test(req.query.sort)) {
    if (!req.query.lat || !req.query.lon) {
      return res.error(errors.input.VALIDATION_FAILED, 'Sort by \''+req.query.sort+'\' requires `lat` and `lon` query parameters be specified');
    }
  }

  if (req.param('search')) {
    var searchOptions = {
      query: {
        multi_match: {
          query: req.param('search')
        , fields: [
            'name.name'
          , 'name.partial'
          , 'businessName.businessName'
          , 'businessName.partial'
          ]
        }
      }
    };

    return elastic.search('product', searchOptions, function(error, results){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      res.json({
        error: null

        // Format results more like magic does
      , data: results.hits.hits.map(function(result){
          result._source._type  = result._type;
          result._source._score = result._score;

          return result._source;
        })

      , meta: {
          total:      results.hits.total
        , max_score:  results.hits.max_score
        }
      });
    });
  }

  var includes = [].concat(req.query.include);
  var includeTags = includes.indexOf('tags') !== -1;
  var includeCats = includes.indexOf('categories') !== -1;
  var includeColl = includes.indexOf('collections') !== -1;
  var includeUserPhotos = includes.indexOf('userPhotos') !== -1;
  var includeLocations = includes.indexOf('locations') !== -1;
  var withs = [];

  // build data query
  var query = sql.query([
    '{withs}',
    'SELECT {fields} FROM products',
      '{sortCacheJoin} {prodLocJoin} {tagJoin} {collectionJoin} {feelingsJoins} {inCollectionJoin} {locationsJoin}',
      'INNER JOIN businesses ON businesses.id = products."businessId"',
      '{where}',
      'GROUP BY {groupby}',
      '{sort} {limit}'
  ]);
  query.fields  = sql.fields()
    .add('products.*')
    .add('businesses.name as "businessName"')
    .add('businesses."isGB" as "businessIsGB"');
  query.where   = sql.where();
  query.sort    = sql.sort(req.query.sort || (req.param('collectionId') ? '-"productsCollections"."createdAt"' : '+name'));
  query.limit   = sql.limit(req.query.limit, req.query.offset);
  query.groupby = sql.fields().add('products.id').add('businesses.id');

  // Don't filter out unverified business products when querying by business and by collection
  if (!req.param('businessId') && !req.param('collectionId') && !req.param('locationId')) {
    query.where.and('businesses."isVerified" is true');
    query.where.and('businesses."isDeleted" is false');
  }

  // hasPhoto filtering
  // :TEMP: iphone mods - only products with photos
  if (req.param('hasPhoto') != undefined && (req.param('hasPhoto') == false || req.param('hasPhoto') == "false" || req.param('hasPhoto') == "0")){
    query.where.and('("photoUrl" is null or "photoUrl" = \'\')');
  } else if (req.param('hasPhoto') || (/iPhone/.test(req.headers['user-agent']) && RegExp('^/v1/products').test(req.path))) {
    query.where.and('"photoUrl" IS NOT NULL');
  }

  // business filtering
  if (req.param('businessId')) { // use param() as this may come from the path or the query
    query.where.and('products."businessId" = $businessId');
    query.$('businessId', req.param('businessId'));
    if(includeLocations) {
      query.fields.add('array_to_json(array_agg(locs.loc)) AS locations')
      query.locationsJoin = [
        'LEFT JOIN (',
          'SELECT "productId", row_to_json(pl) AS loc FROM "productLocations" pl',
        ') locs on locs."productId" = products.id'
      ].join(' ');
    }
  }
  // business tag filter
  else if (req.param('businessType')) {
    if (req.param('businessType') == 'other') {
      query.where.and([
        'NOT EXISTS',
          '(SELECT "businessTags".id FROM "businessTags"',
            'WHERE "businessTags"."businessId" = businesses.id',
              'AND'+sql.filtersMap(query, '"businessTags".tag {=} $filter', ['food', 'apparel']),
          ')'
      ].join(' '));
    } else {
      query.where.and([
        'EXISTS',
          '(SELECT "businessTags".id FROM "businessTags"',
            'WHERE "businessTags"."businessId" = businesses.id',
              'AND'+sql.filtersMap(query, '"businessTags".tag {=} $filter', req.param('businessType')),
          ')'
      ].join(' '));
    }
  }

  // location filtering
  if (req.query.lat && req.query.lon) {
    query.prodLocJoin = [
      'LEFT JOIN "productLocations" ON',
        '"productLocations"."productId" = products.id'
    ].join(' ');
    query.$('lat', req.query.lat);
    query.$('lon', req.query.lon);
    query.fields.add('min(earth_distance(ll_to_earth($lat,$lon), "productLocations".position)) AS distance');
    if (req.query.range) {
      // If querying by range, don't include null lat/lon
      query.prodLocJoin = query.prodLocJoin.replace('LEFT', 'INNER');
      query.prodLocJoin += ' AND earth_box(ll_to_earth($lat,$lon), $range) @> ll_to_earth("productLocations".lat, "productLocations".lon)';
      query.$('range', req.query.range);
    }
  }

  // location id filtering
  if (req.param('locationId')){
    var joinType = "inner";

    if (req.param('spotlight') || includes.indexOf('inSpotlight') > -1) {
      query.fields.add('case when "productLocations"."inSpotlight" IS NULL THEN false ELSE "productLocations"."inSpotlight" end as "inSpotlight"');
      query.fields.add('"productLocations"."inGallery"');
      query.fields.add('"productLocations"."spotlightOrder"');
      query.fields.add('"productLocations"."galleryOrder"');
    }
    if (!query.prodLocJoin) {
      query.prodLocJoin = [
        '{joinType} JOIN "productLocations"'
        , 'ON products."id" = "productLocations"."productId"'
        , 'AND "productLocations"."locationId" = $locationId'
      ].join(' ');
    } else {
      query.prodLocJoin += ' AND "productLocations"."locationId" = $locationId';
    }

    query.groupby.add('"productLocations".id');

    query.$('locationId', req.param('locationId'));

    if (req.param('all')){
      joinType = "left";
      query.fields.add('"productLocations".id is not null as "isAvailable"');
      query.prodLocJoin += [
        ' INNER JOIN "locations"'
      , 'ON "locations"."businessId" = products."businessId"'
      , 'AND locations.id = $locationId'
      ].join(' ');
    }

    query.prodLocJoin = query.prodLocJoin.replace("{joinType}", joinType);
  }

  // tag filtering
  if (req.query.tag) {
    var tagsClause = sql.filtersMap(query, '"productTags".tag {=} $filter', req.query.tag);
    query.tagJoin = [
      'INNER JOIN "productsProductTags" ON',
        '"productsProductTags"."productId" = products.id',
      'INNER JOIN "productTags" ON',
        '"productTags".id = "productsProductTags"."productTagId" AND',
        tagsClause
    ].join(' ');
  }

  // consumer collection filtering
  if (req.param('collectionId')) {
    if (req.param('collectionId') == 'all') {
      query.collectionJoin = [
        'INNER JOIN collections ON',
          'collections."userId" = $userId',
        'INNER JOIN "productsCollections" ON',
          '"productsCollections"."productId" = products.id AND',
          '"productsCollections"."collectionId" = collections.id'
      ].join(' ');
      query.$('userId', req.param('userId'));
    } else {
      query.collectionJoin = [
        'INNER JOIN collections ON',
          '(collections.id::text = $collectionId OR collections."pseudoKey" = $collectionId) AND collections."userId" = $userId',
        'INNER JOIN "productsCollections" ON',
          '"productsCollections"."productId" = products.id AND',
          '"productsCollections"."collectionId" = collections.id'
      ].join(' ');
      query.$('collectionId', req.param('collectionId'));
      query.$('userId', req.param('userId'));

    }
    query.fields.add('"productsCollections"."createdAt" as "createdAt"');
    query.groupby.add('"productsCollections"."createdAt"');
  }

  // tag include
  if (includeTags) {
    query.fields.add([
      'array_to_json(array(SELECT row_to_json("productTags".*) FROM "productTags"',
        'INNER JOIN "productsProductTags"',
          'ON "productsProductTags"."productTagId" = "productTags".id',
          'AND "productsProductTags"."productId" = products.id',
      ')) as tags'
    ].join(' '));
  }

  // category include
  if (includeCats) {
    query.fields.add([
      'array_to_json(array(SELECT row_to_json("productCategories".*) FROM "productCategories"',
        'INNER JOIN "productsProductCategories"',
          'ON "productsProductCategories"."productCategoryId" = "productCategories".id',
          'AND "productsProductCategories"."productId" = products.id',
      ')) as categories'
    ].join(' '));
  }

  // user feelings join
  if (req.session.user) {
    query.feelingsJoins = [
      'LEFT JOIN "productLikes" ON products.id = "productLikes"."productId" AND "productLikes"."userId" = $userId',
      'LEFT JOIN "productWants" ON products.id = "productWants"."productId" AND "productWants"."userId" = $userId',
      'LEFT JOIN "productTries" ON products.id = "productTries"."productId" AND "productTries"."userId" = $userId'
    ].join(' ');
    query.fields.add('("productLikes".id IS NOT NULL) AS "userLikes"');
    query.fields.add('("productWants".id IS NOT NULL) AS "userWants"');
    query.fields.add('("productTries".id IS NOT NULL) AS "userTried"');
    query.fields.add('COUNT("productWants".id) OVER() as "metaUserWants"');
    query.fields.add('COUNT("productLikes".id) OVER() as "metaUserLikes"');
    query.fields.add('COUNT("productTries".id) OVER() as "metaUserTries"');
    query.groupby.add('"productLikes".id');
    query.groupby.add('"productWants".id');
    query.groupby.add('"productTries".id');
    query.$('userId', req.session.user.id);

    if (req.param('userLikes') !== null && typeof req.param('userLikes') != 'undefined')
      query.where.and('"productLikes" IS ' + (utils.parseBool(req.param('userLikes')) ? 'NOT' : '' )  +' NULL');

    if (req.param('userTried') !== null && typeof req.param('userTried') != 'undefined')
      query.where.and('"productTries" IS ' + (utils.parseBool(req.param('userTried')) ? 'NOT' : '' )  +' NULL');

    if (req.param('userWants') !== null && typeof req.param('userWants') != 'undefined')
      query.where.and('"productWants" IS ' + (utils.parseBool(req.param('userWants')) ? 'NOT' : '' )  +' NULL');
  }

  // user photos join
  if (req.session.user && includeUserPhotos) {
    query.fields.add('array_to_json(array(SELECT row_to_json("photos".*) from "photos" WHERE "userId" = $userId AND "productId" = products.id)) as photos');
    query.$('userId', req.session.user.id);
  }

  // is in collection join
  if (includeColl && req.session.user) {
    withs.push([
      'prod_coll as (SELECT'
    , '  (CASE WHEN collections."pseudoKey" IS NOT NULL THEN collections."pseudoKey" ELSE collections.id::text END) as id,'
    , '  "productId"'
    , '  FROM "productsCollections"'
    , '  LEFT JOIN collections ON'
    , '    "productsCollections"."collectionId" = collections.id'
    , '  WHERE "productsCollections"."userId" = $userId)'
    ].join('\n'));

    query.fields.add('array( select id from prod_coll where "productId" = products.id ) AS "collections"');
    query.$('userId', req.session.user.id);
  }

  // custom sorts
  if (req.query.sort) {
    if (/random/.test(req.query.sort))
      query.fields.add('random() as random'); // this is really inefficient
    else if (/popular/.test(req.query.sort)) {
      query.sortCacheJoin = 'INNER JOIN "poplistItems" pli ON pli."productId" = products.id AND pli.listid = $poplistid AND pli."isActive" = true';
      query.fields.add('pli.id as popular');
      query.groupby.add('pli.id');

      // remember which list the user is looking at, but refresh the choice every hour
      var listid = Math.floor(Math.random()*config.algorithms.popular.numLists);
      var onehour = 1000 * 60 * 60;
      if (req.query.listid)
        listid = req.query.listid;
      else if (req.session) {
        if (req.session.currentPopListid && req.session.currentPopListCreated && ((new Date() - new Date(req.session.currentPopListCreated)) < onehour || req.query.offset < 1))
          listid = req.session.currentPopListid; // :TEMP: retrieve current list from session (if I remember right, better if replaced by a query param)
        else {
          req.session.currentPopListid = listid; // :TEMP: store current list from session
          req.session.currentPopListCreated = new Date();
        }
      }
      query.$('poplistid', listid);
    }
    else if (/distance/.test(req.query.sort)) {
      // filter the products to select from by INNER JOINing a random subset of products in the nearby grid locations
      withs.push('"oneOfEachClose" AS (SELECT DISTINCT ON ("businessId") * FROM "nearbyGridItems" WHERE earth_box(ll_to_earth($lat,$lon), 1000) @> position AND "isActive"=true LIMIT 30)');
      withs.push('"randomSubset" AS (SELECT * FROM "nearbyGridItems" WHERE "isActive"=true ORDER BY cachedrandom*cachedrandom*earth_distance(ll_to_earth($lat,$lon), position) LIMIT 250)');
      withs.push('"nearbyItems" AS (SELECT * FROM "oneOfEachClose" UNION SELECT * FROM "randomSubset")');
      query.sortCacheJoin = 'INNER JOIN "nearbyItems" ni ON ni."productId" = products.id AND ni."isActive" = true';
      // the distance field is set by the lat/lon query-param handling; no need to duplicate here
      // query.fields.add('earth_distance(ll_to_earth($lat,$lon), ni.position) as distance');
      // query.groupby.add('ni.position');
    }
  }

  // name filter
  if (req.param('filter')){
    query.where.and('products.name ILIKE $nameFilter');
    query.$('nameFilter', '%' + req.param('filter') + '%');
  }

  if (withs.length > 0) query.withs = 'WITH ' + withs.join(',\n');

  query.fields.add('COUNT(*) OVER() as "metaTotal"');

  // run data query
  db.query(query, function(error, rows, dataResult){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var total = 0, userLikes = 0, userWants = 0, userTries = 0;
    if (dataResult.rowCount !== 0) {
      total = dataResult.rows[0].metaTotal;
      userLikes = dataResult.rows[0].metaUserLikes;
      userWants = dataResult.rows[0].metaUserWants;
      userTries = dataResult.rows[0].metaUserTries;
    }

    // parse out embedded results
    if (includeTags || includeCats || includeUserPhotos) {
      dataResult.rows.forEach(function(row) {
        if (includeTags) {
          try { row.tags = (row.tags) ? (row.tags) : []; } catch(e) {}
        }
        if (includeCats) {
          try { row.categories = (row.categories) ? (row.categories) : []; } catch(e) {}
        }
        if (includeUserPhotos) {
          try { row.photos = (row.photos) ? (row.photos) : []; } catch(e) {}
        } if (includeLocations) {
          if(!row.locations || row.locations[0] == null) {
            row.locations = [];
          }
        }
      });
    }

    res.json({ error: null, data: dataResult.rows, meta: { total:total, userLikes:userLikes, userWants:userWants, userTries:userTries } });
  });
};

/**
 * Get product
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-product', req.uuid];
  logger.routes.debug(TAGS, 'fetching product');

  var includes = [].concat(req.query.include);
  var includeUserPhotos = includes.indexOf('userPhotos') !== -1;
  var includeColl = includes.indexOf('collections') !== -1;

  var withs = [];

  var query = sql.query([
    '{withs}',
    'SELECT {fields},',
      'array_to_json(array(SELECT row_to_json("productTags".*) FROM "productTags"',
        'INNER JOIN "productsProductTags"',
          'ON "productsProductTags"."productTagId" = "productTags".id',
          'AND "productsProductTags"."productId" = products.id',
      ')) as tags,',
      'array_to_json(array(SELECT row_to_json("productCategories".*) FROM "productCategories"',
        'INNER JOIN "productsProductCategories"',
          'ON "productsProductCategories"."productCategoryId" = "productCategories".id',
          'AND "productsProductCategories"."productId" = products.id',
      ')) as categories',
    'FROM products',
      'INNER JOIN businesses ON businesses.id = products."businessId"',
      '{collectionJoin}',
      'WHERE products.id = $id',
      'GROUP BY {groupby}'
  ]);
  query.$('id', +req.param('productId') || 0);
  query.fields  = sql.fields();
  query.groupby = sql.fields().add('products.id').add('businesses.id');

  query.fields.add('products.*');
  query.fields.add('businesses.name as "businessName"');
  query.fields.add('businesses."isGB" as "businessIsGB"');

  // user feelings join
  if (req.session.user) {
    query.fields.add('((SELECT 1 FROM "productLikes" WHERE products.id = "productLikes"."productId" AND "productLikes"."userId" = $userId) IS NOT NULL) AS "userLikes"');
    query.fields.add('((SELECT 1 FROM "productWants" WHERE products.id = "productWants"."productId" AND "productWants"."userId" = $userId) IS NOT NULL) AS "userWants"');
    query.fields.add('((SELECT 1 FROM "productTries" WHERE products.id = "productTries"."productId" AND "productTries"."userId" = $userId) IS NOT NULL) AS "userTried"');
    query.$('userId', req.session.user.id);
  }

  // user photos join
  if (req.session.user && includeUserPhotos) {
    query.fields.add('array_to_json(array(SELECT row_to_json("photos".*) from "photos" WHERE "userId" = $userId AND "productId" = products.id)) as photos');
    query.$('userId', req.session.user.id);
  }

  // is in collection join
  if (includeColl && req.session.user) {
    withs.push([
      'prod_coll as (SELECT'
    , '  (CASE WHEN collections."pseudoKey" IS NOT NULL THEN collections."pseudoKey" ELSE collections.id::text END) as id,'
    , '  "productId"'
    , '  FROM "productsCollections"'
    , '  LEFT JOIN collections ON'
    , '    "productsCollections"."collectionId" = collections.id'
    , '  WHERE "productsCollections"."userId" = $userId)'
    ].join('\n'));

    query.fields.add('array( select id from prod_coll where "productId" = products.id ) AS "collections"');
    query.$('userId', req.session.user.id);
  }

  if (withs.length > 0) query.withs = 'WITH ' + withs.join(',\n');

  db.query(query, function(error, rows, result){
    if (error) return console.log(error), res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var product = result.rows[0];
    if (!product) return res.status(404).end();

    if (typeof product.tags != 'undefined')
      product.tags = (product.tags) ? (product.tags) : [];
    if (typeof product.categories != 'undefined')
      product.categories = (product.categories) ? (product.categories) : [];
    if (typeof product.photos != 'undefined')
      product.photos = (product.photos) ? (product.photos) : [];

    return res.json({ error: null, data: product });
  });
};

/**
 * Insert product
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.create = function(req, res){
  var TAGS = ['create-product', req.uuid];

  var inputs = req.body;
  var categories = inputs.categories;
  var tags = inputs.tags;
  delete inputs.categories;
  delete inputs.tags;

  if (req.session.user.groups.indexOf('consumer') != -1 &&
      req.session.user.groups.indexOf('admin') == -1 &&
      req.session.user.groups.indexOf('sales') == -1)
    inputs.isVerified = false;

  var stage = {
    // Once we receive the client, kick everything off by
    clientReceived: function(error, client, done){
      if (error){
        logger.routes.error(TAGS, error);
        return res.error(errors.internal.DB_FAILURE, error);
      }
      //attach a drain listener here instead of handling the error
      //throughout the entire callback chain below
      //as soon as the client empties its query queue
      //it will return itself
      client.once('drain', done);

      stage.ensureCategoriesAndTags(client);
    }

    // Ensure the categories and tags provided in the body belong to the business
    // If they didn't provide categories or tags, move on to the next step
  , ensureCategoriesAndTags: function(client){
      var
        checkCategories = (categories && categories.length > 0)
      , checkTags       = (tags && tags.length > 0)
      ;

      // Run these guys in parallel and ensure in the end they both work
      utils.parallel({
        categories: function(done){
          if (!checkCategories) return done();

          var query = sql.query([
            'SELECT COUNT("productCategories".id) AS count',
              'FROM "productCategories"',
              'WHERE "productCategories"."businessId" = $businessId',
                'AND "productCategories".id IN ({categoryIds})'
          ]);
          query.$('businessId', req.body.businessId);
          query.categoryIds = [].concat(categories).map(function(i) { return parseInt(i,10); }).join(',');
          client.query(query.toString(), query.$values, done);
        }

      , tags: function(done){
          if (!checkTags) return done();

          var query = sql.query([
            'SELECT COUNT("productTags".id) AS count',
              'FROM "productTags"',
              'WHERE "productTags"."businessId" = $businessId',
                'AND "productTags".id IN ({tagIds})'
          ]);
          query.$('businessId', req.body.businessId);
          query.tagIds = [].concat(tags).map(function(i) { return parseInt(i,10); }).join(',');
          client.query(query.toString(), query.$values, done);
        }

      }, function(error, results){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        if (checkCategories && results.categories.rows[0].count < categories.length)
          return res.error(errors.input.INVALID_CATEGORY_IDS);

        if (checkTags && results.tags.rows[0].count < tags.length)
          return res.error(errors.input.INVALID_TAGS);

        return stage.insertProduct(client);
      });

    }

    // Validate and insert the provided product
  , insertProduct: function(client){

      if (!inputs.isEnabled) inputs.isEnabled = true;

      inputs.likes = 0;
      inputs.wants = 0;
      inputs.tries = 0;

      var error = utils.validate(inputs, db.schemas.products);
      if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

      var query = sql.query('INSERT INTO products ({fields}) VALUES ({values}) RETURNING id');
      query.fields = sql.fields().addObjectKeys(inputs);
      query.values = sql.fields().addObjectValues(inputs, query);

      // run query
      client.query(query.toString(), query.$values, function(error, results){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        // If they didn't provide categories or tags, stop here
        if ((!categories || categories.length === 0) && (!tags || tags.length === 0))
          return stage.insertProductLocations(client, results.rows[0].id);

        // Move on to next stage
        stage.insertProductCategoriesTagsRelations(client, results.rows[0].id, categories, tags);
      });
    }

    // Setup the relations between the provided categories
  , insertProductCategoriesTagsRelations: function(client, productId, categories, tags){
      categories  = categories  || [];
      tags        = tags        || [];

      var
        isCatObj  = (categories.length > 0) ? !!categories[0].id : false
      , isTagObj  = (tags.length > 0) ? !!tags.id : false

        // Array of functions to execute in parallel
      , queries = []

        // Returns a function that executes a query to be executed in parallel via async
      , getCategoryQueryFunction = function(values){
          return function(complete){
            var query = sql.query('INSERT INTO "productsProductCategories" ({fields}) VALUES ({values})');
            query.fields = sql.fields().addObjectKeys(values);
            query.values = sql.fields().addObjectValues(values, query);
            client.query(query.toString(), query.$values, complete);
          };
        }
      , getTagQueryFunction = function(values){
          return function(complete){
            var query = sql.query('INSERT INTO "productsProductTags" ({fields}) VALUES ({values})');
            query.fields = sql.fields().addObjectKeys(values);
            query.values = sql.fields().addObjectValues(values, query);

            client.query(query.toString(), query.$values, complete);
          };
        }
      ;

      // Queue up category query functions
      for (var i = categories.length - 1; i >= 0; i--){
        queries.push(
          getCategoryQueryFunction({
            productId: productId
          , productCategoryId: isCatObj ? categories[i].id : categories[i]
          })
        );
      }

      // Queue up tag query functions
      for (var i = tags.length - 1; i >= 0; i--) {
        queries.push(
          getTagQueryFunction({
            productId: productId
          , productTagId: isTagObj ? tags[i].id : tags[i]
          })
        );
      }

      // Next stage
      utils.parallel(queries, function(error, results){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
        stage.insertProductLocations(client, productId);
      });
    }

    // create productLocations for all locations related to the product's business
  , insertProductLocations: function(client, productId) {

      var query = sql.query([
        'INSERT INTO "productLocations" ("productId", "locationId", "businessId", lat, lon, position, "inSpotlight")',
          'SELECT $productId, locations.id, $businessId, locations.lat, locations.lon, ll_to_earth(locations.lat, locations.lon), true',
            'FROM locations WHERE locations."businessId" = $businessId'
      ]);
      query.$('productId', productId);
      query.$('businessId', req.body.businessId);

      client.query(query.toString(), query.$values, function(error, result) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        stage.end(productId);
      });
    }

  , end: function(productId) {
      res.json({ error: null, data: { id: productId } });

      inputs.id = productId;
      if (categories)
        inputs.categories = categories;
      if (tags)
        inputs.tags = tags;
      magic.emit('products.create', inputs);
    }
  };

  // Kick it off
  db.getClient(TAGS, stage.clientReceived);
};

/**
 * Update product
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-product', req.uuid];

  var inputs = req.body;
  var categories = inputs.categories;
  var tags = inputs.tags;
  delete inputs.categories;
  delete inputs.tags;

  var stage = {
    // Once we receive the client, kick everything off by
    clientReceived: function(error, client, done){
      if (error){
        logger.routes.error(TAGS, error);
        return res.error(errors.internal.DB_FAILURE, error);
      }
      //attach a drain listener here instead of handling the error
      //throughout the entire callback chain below
      //as soon as the client empties its query queue
      //it will return itself
      client.once('drain', done);

      stage.ensureCategoriesAndTags(client);
    }

   , ensureCategoriesAndTags: function(client){
      var
        checkCategories = (categories && categories.length > 0)
      , checkTags       = (tags && tags.length > 0)
      ;

      // Run these guys in parallel and ensure in the end they both work
      utils.parallel({
        categories: function(done){
          if (!checkCategories) return done();

          var query = sql.query([
            'SELECT COUNT("productCategories".id) AS count',
              'FROM "productCategories"',
                'INNER JOIN products',
                  'ON products."businessId" = "productCategories"."businessId"',
                  'AND products.id = $productId',
              'WHERE "productCategories".id IN ({categoryIds})'
          ]);
          query.$('productId', req.param('productId'));
          query.categoryIds = [].concat(categories).map(function(i) { return parseInt(i,10); }).join(',');
          client.query(query.toString(), query.$values, done);
        }

      , tags: function(done){
          if (!checkTags) return done();

          var query = sql.query([
            'SELECT COUNT("productTags".id) AS count',
              'FROM "productTags"',
                'INNER JOIN products',
                  'ON products."businessId" = "productTags"."businessId"',
                  'AND products.id = $productId',
              'WHERE "productTags".id IN ({tagIds})'
          ]);
          query.$('productId', req.param('productId'));
          query.tagIds = [].concat(tags).map(function(i) { return parseInt(i,10); }).join(',');
          client.query(query.toString(), query.$values, done);
        }

      }, function(error, results){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        if (checkCategories && results.categories.rows[0].count < categories.length)
          return res.error(errors.input.INVALID_CATEGORY_IDS);

        if (checkTags && results.tags.rows[0].count < tags.length)
          return res.error(errors.input.INVALID_TAGS);

        return stage.updateProduct(client);
      });
    }

    // Validate and insert the provided product
  , updateProduct: function(client){

      if (!inputs.isEnabled) inputs.isEnabled = true;
      delete inputs.likes;
      delete inputs.wants;
      delete inputs.tries;

      var error = utils.validate(inputs, db.schemas.products);
      if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

      var query = sql.query('UPDATE products SET {updates} WHERE id=$productId RETURNING "businessId"');
      query.updates = sql.fields().addUpdateMap(inputs, query);
      query.$('productId', +req.param('productId') || 0);

      client.query(query.toString(), query.$values, function(error, results){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        if (!categories && !tags)
          return stage.end();

        stage.removeCategoriesAndTags(client, req.param('productId'), results.rows[0].businessId, categories, tags);
      });
    }

  , removeCategoriesAndTags: function(client, productId, businessId, categories, tags){
      var removes = [];
      if (categories) {
        removes.push(function(done){
          var query = sql.query('DELETE FROM "productsProductCategories" WHERE "productId"=$productId');
          query.$('productId', productId);
          client.query(query.toString(), query.$values, done);
        });
      }
      if (tags) {
        removes.push(function(done){
          var query = sql.query('DELETE FROM "productsProductTags" WHERE "productId"=$productId');
          query.$('productId', productId);
          client.query(query.toString(), query.$values, done);
        });
      }

      var onComplete = function(error, results){
          if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

          stage.updateCategoriesTags(client, productId, businessId, categories, tags);
        }
      ;

      utils.parallel(removes, onComplete);
    }

  , updateCategoriesTags: function(client, productId, businessId, categories, tags){
      var
        inParallel = {
          categories: function(done){
            categories = categories || [];

            // Nothing to update, we were just performing a delete
            if (categories.length === 0) return done();

            var
              isObj   = !!categories[0].id

              // Array of functions to execute in parallel
            , queries = []

              // Returns a function that executes a query to be executed in parallel via async
            , getQueryFunction = function(values){
                return function(complete){
                  var query = sql.query('INSERT INTO "productsProductCategories" ({fields}) VALUES ({values})');
                  query.fields = sql.fields().addObjectKeys(values);
                  query.values = sql.fields().addObjectValues(values, query);
                  client.query(query.toString(), query.$values, complete);
                };
              }
            ;

            // Queue up query functions
            for (var i = categories.length - 1; i >= 0; i--){
              queries.push(
                getQueryFunction({
                  productId: productId
                , productCategoryId: isObj ? categories[i].id : categories[i]
                })
              );
            }

            // That's it!
            utils.parallel(queries, done);
          }

        , tags: function(done){
            tags = tags || [];

            // Nothing to update, we were just performing a delete
            if (tags.length === 0) return done();

            var
              isObj = !!tags.id

              // Array of functions to execute in parallel
            , queries = []

              // Returns a function that executes a query to be executed in parallel via async
            , getQueryFunction = function(values){
                return function(complete){
                  var query = sql.query('INSERT INTO "productsProductTags" ({fields}) VALUES ({values})');
                  query.fields = sql.fields().addObjectKeys(values);
                  query.values = sql.fields().addObjectValues(values, query);
                  client.query(query.toString(), query.$values, complete);
                };
              }
            ;

            // Queue up query functions
            for (var i = tags.length - 1; i >= 0; i--){
              queries.push(
                getQueryFunction({
                  productId: productId
                , productTagId: isObj ? tags[i].id : tags[i]
                })
              );
            }

            // That's it!
            utils.parallel(queries, done);
          }
        }

      , onComplete = function(error, results){
          if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

          stage.end();
        }
      ;

      utils.parallel(inParallel, onComplete);
    }
  , end: function() {
      res.noContent();

      if (categories)
        inputs.categories = categories;
      if (tags)
        inputs.tags = tags;
      magic.emit('products.update', req.param('productId'), inputs);
    }
  };

  if (inputs.userLikes != null || inputs.userWants != null || inputs.userTried != null) {
    // update feelings first if present
    db.procedures.updateProductFeelings(TAGS, req.param('productId'), req.session.user.id, inputs.userLikes, inputs.userWants, inputs.userTried, req.data('locationId'), function(err, result) {
      if (err) return res.json({ error: error, data: null, meta: null }), logger.routes.error(TAGS, error);

      delete inputs.userLikes;
      delete inputs.userWants;
      delete inputs.userTried;

      db.getClient(TAGS, stage.clientReceived);
    });
  }
  else
    db.getClient(TAGS, stage.clientReceived);
};

/**
 * Delete product
 * TODO: remove product category relations too
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.del = function(req, res){
  var TAGS = ['delete-product', req.uuid];

  var query = sql.query('DELETE FROM products WHERE id=$productId');
  query.$('productId', +req.param('productId') || 0);

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
    res.noContent();
    magic.emit('products.deleted', +req.param('productId'));
  });
};

/**
 * List categories related to the product
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.listCategories = function(req, res) {
  var TAGS = ['list-product-productcategory-relations', req.uuid];
  logger.routes.debug(TAGS, 'fetching list of product\'s categories');

  // build query
  var query = sql.query([
    'SELECT * FROM "productsProductCategories"',
      'INNER JOIN "productCategories" ON "productCategories".id = "productsProductCategories"."productCategoryId"',
      'WHERE "productsProductCategories"."productId" = $productId'
  ]);
  query.$('productId', +req.param('productId') || 0);

  // run query
  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    return res.json({ error: null, data: result.rows });
  });

};

/**
 * Add a category relation to the product
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.addCategory = function(req, res) {
  var TAGS = ['create-product-productcategory-relation', req.uuid];

  var inputs = { productId:req.param('productId'), productCategoryId:req.body.id };

  // :TODO: make sure the product exists?
  // :TODO: make sure product category's businessId is the same as products

  var query = sql.query([
    'INSERT INTO "productsProductCategories" ("productId", "productCategoryId")',
      'SELECT $productId, $productCategoryId WHERE NOT EXISTS',
        '(SELECT 1 FROM "productsProductCategories"',
          'WHERE "productId" = $productId',
          'AND "productCategoryId" = $productCategoryId)'
  ]);
  query.$('productId', inputs.productId);
  query.$('productCategoryId', inputs.productCategoryId);

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
    res.noContent();
  });
};

/**
 * Remove a category relation from the product
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.delCategory = function(req, res) {
  var TAGS = ['delete-product-productcategory-relation', req.uuid];

  // :TODO: make sure the product exists?

  var inputs = { productId:req.param('productId'), productCategoryId:req.param('categoryId') };
  var error = utils.validate(inputs, db.schemas.productsProductCategories);
  if (error) return res.error(errors.inputs.VALIDATION_FAILED), logger.routes.error(TAGS, error);

  var query = sql.query([
    'DELETE FROM "productsProductCategories"',
      'WHERE "productId"=$productId',
        'AND "productCategoryId"=$productCategoryId'
  ]);
  query.$('productId', inputs.productId);
  query.$('productCategoryId', inputs.productCategoryId);

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
    res.noContent();
  });
};

/**
 * Add/remove user feelings relations (productLikes, productWants, productTries) to the product
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.updateFeelings = function(req, res) {
  var TAGS = ['update-product-userfeelings', req.uuid];

  db.procedures.updateProductFeelings(TAGS, req.param('productId'), req.session.user.id, req.body.isLiked, req.body.isWanted, req.body.isTried, req.data('locationId'), function(err, result) {
    if (err) return res.json({ error: error, data: null, meta: null }), logger.routes.error(TAGS, error);
    res.noContent();
  });
};
