
/*
 * Product resources
 */

var
  db          = require('../../db')
, sql         = require('../../lib/sql')
, utils       = require('../../lib/utils')
, errors      = require('../../lib/errors')
, magic       = require('../../lib/magic')
, Transaction = require('pg-transaction')
, async       = require('async')

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

  // retrieve pg client
  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // if sort=distance, validate that we got lat/lon
    if (req.query.sort && req.query.sort.indexOf('distance') !== -1) {
      if (!req.query.lat || !req.query.lon) {
        return res.error(errors.input.VALIDATION_FAILED, 'Sort by \'distance\' requires `lat` and `lon` query parameters be specified');
      }
    }
    var includes = [].concat(req.query.include);
    var includeTags = includes.indexOf('tags') !== -1;
    var includeCats = includes.indexOf('categories') !== -1;
    var includeColl = includes.indexOf('collections') !== -1;
    var includeUserPhotos = includes.indexOf('userPhotos') !== -1;

    // build data query
    var query = sql.query([
      'SELECT {fields} FROM products',
        '{poplistJoin} {prodLocJoin} {tagJoin} {collectionJoin} {feelingsJoins} {inCollectionJoin}',
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
    query.sort    = sql.sort(req.query.sort || '+name');
    query.limit   = sql.limit(req.query.limit, req.query.offset);
    query.groupby = sql.fields().add('products.id').add('businesses.id');

    // hasPhoto filtering
    // :TEMP: iphone mods - only products with photos
    if (req.param('hasPhoto') || (/iPhone/.test(req.headers['user-agent']) && RegExp('^/v1/products').test(req.path))) {
      query.where.and('"photoUrl" IS NOT NULL');
    }

    // business filtering
    if (req.param('businessId')) { // use param() as this may come from the path or the query
      query.where.and('products."businessId" = $businessId');
      query.$('businessId', req.param('businessId'));
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
        'INNER JOIN "productLocations" ON',
          '"productLocations"."productId" = products.id'
      ].join(' ');
      query.$('lat', req.query.lat);
      query.$('lon', req.query.lon);
      query.fields.add('min(earth_distance(ll_to_earth($lat,$lon), "productLocations".position)) AS distance');
      if (req.query.range) {
        query.prodLocJoin += ' AND earth_box(ll_to_earth($lat,$lon), $range) @> ll_to_earth("productLocations".lat, "productLocations".lon)';
        query.$('range', req.query.range);
      }
    }

    // location id filtering
    if (req.param('locationId')){
      var joinType = "inner";

      if (req.param('spotlight') || includes.indexOf('inSpotlight') > -1)
        query.fields.add('case when "productLocations"."inSpotlight" IS NULL THEN false ELSE "productLocations"."inSpotlight" end as "inSpotlight"');

      if (!query.prodLocJoin) {
        query.prodLocJoin = [
          '{joinType} join "productLocations"'
          , 'ON products."id" = "productLocations"."productId"'
          , 'and "productLocations"."locationId" = $locationId'
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
          'inner join "locations"'
        , 'on "locations"."businessId" = products."businessId"'
        , 'and locations.id = $locationId'
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
      query.fields.add([
        'array(SELECT "collectionId" FROM "productsCollections"',
          'WHERE "productsCollections"."productId" = products.id',
            'AND "productsCollections"."userId" = $userId',
        ') AS "collections"'
      ].join(' '));
      query.$('userId', req.session.user.id);
    }

    // custom sorts
    if (req.query.sort) {
      if (req.query.sort.indexOf('random') !== -1)
        query.fields.add('random() as random'); // this is really inefficient
      else if (req.query.sort.indexOf('popular') !== -1) {
        query.poplistJoin = 'INNER JOIN "poplistItems" pli ON pli."productId" = products.id AND pli.listid = $poplistid AND pli."isActive" = true';
        query.fields.add('pli.id as popular');
        query.groupby.add('pli.id');

        var listid = Math.floor(Math.random()*config.algorithms.popular.numLists);
        var onehour = 1000 * 60 * 60;
        if (req.query.listid)
          listid = req.query.listid;
        else if (req.session) {
          if (req.session.currentPopListid && req.session.currentPopListCreated && ((new Date() - new Date(req.session.currentPopListCreated)) < onehour || req.query.offset < 1))
            listid = req.session.currentPopListid; // :TEMP: retrieve current list from session
          else {
            req.session.currentPopListid = listid; // :TEMP: store current list from session
            req.session.currentPopListCreated = new Date();
          }
        }
        query.$('poplistid', listid);
      }
    }

    query.fields.add('COUNT(*) OVER() as "metaTotal"');

    // run data query
    client.query(query.toString(), query.$values, function(error, dataResult){
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
            try { row.tags = (row.tags) ? JSON.parse(row.tags) : []; } catch(e) {}
          }
          if (includeCats) {
            try { row.categories = (row.categories) ? JSON.parse(row.categories) : []; } catch(e) {}
          }
          if (includeUserPhotos) {
            try { row.photos = (row.photos) ? JSON.parse(row.photos) : []; } catch(e) {}
          }
        });
      }

      res.json({ error: null, data: dataResult.rows, meta: { total:total, userLikes:userLikes, userWants:userWants, userTries:userTries } });
    });
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

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var includes = [].concat(req.query.include);
    var includeUserPhotos = includes.indexOf('userPhotos') !== -1;

    var query = sql.query([
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

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return console.log(error), res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var product = result.rows[0];
      if (!product) return res.status(404).end();

      if (typeof product.tags != 'undefined')
        product.tags = (product.tags) ? JSON.parse(product.tags) : [];
      if (typeof product.categories != 'undefined')
        product.categories = (product.categories) ? JSON.parse(product.categories) : [];
      if (typeof product.photos != 'undefined')
        product.photos = (product.photos) ? JSON.parse(product.photos) : [];

      return res.json({ error: null, data: product });
    });
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
    clientReceived: function(error, client){
      if (error){
        logger.routes.error(TAGS, error);
        return res.error(errors.internal.DB_FAILURE, error);
      }

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
          return stage.end(results.rows[0].id);

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
    clientReceived: function(error, client){
      if (error){
        logger.routes.error(TAGS, error);
        return res.error(errors.internal.DB_FAILURE, error);
      }

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

  // Kick it off
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

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('DELETE FROM products WHERE id=$productId');
    query.$('productId', +req.param('productId') || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      res.noContent();
    });
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

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build query
    var query = sql.query([
      'SELECT * FROM "productsProductCategories"',
        'INNER JOIN "productCategories" ON "productCategories".id = "productsProductCategories"."productCategoryId"',
        'WHERE "productsProductCategories"."productId" = $productId'
    ]);
    query.$('productId', +req.param('productId') || 0);

    // run query
    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      return res.json({ error: null, data: result.rows });
    });
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

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

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

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      res.noContent();
    });
  });
};

/**
 * Remove a category relation from the product
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.delCategory = function(req, res) {
  var TAGS = ['delete-product-productcategory-relation', req.uuid];

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

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

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      res.noContent();
    });
  });
};

/**
 * Add/remove user feelings relations (productLikes, productWants, productTries) to the product
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.updateFeelings = function(req, res) {
  var TAGS = ['update-product-userfeelings', req.uuid];

  db.getClient(TAGS, function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var inputs = {
      productId : req.param('productId'),
      userId    : req.session.user.id,
      isLiked   : req.body.isLiked,
      isWanted  : req.body.isWanted,
      isTried   : req.body.isTried
    };

    // start the transaction
    var tx = new Transaction(client);
    tx.begin(function(error) {
      if (error) return res.json({ error: error, data: null, meta: null }), logger.routes.error(TAGS, error);

      // lock the product row and get the current feelings
      var query = sql.query([
        'SELECT products.id AS "productId", "productLikes".id as "isLiked", "productWants".id as "isWanted", "productTries".id as "isTried"',
          'FROM products',
          'LEFT JOIN "productLikes" ON "productLikes"."productId" = $productId AND "productLikes"."userId" = $userId',
          'LEFT JOIN "productWants" ON "productWants"."productId" = $productId AND "productWants"."userId" = $userId',
          'LEFT JOIN "productTries" ON "productTries"."productId" = $productId AND "productTries"."userId" = $userId',
          'WHERE products.id = $1 FOR UPDATE OF products'
      ]);
      query.$('productId', +req.param('productId') || 0);
      query.$('userId', +req.session.user.id || 0);
      tx.query(query.toString(), query.$values, function(error, result) {
        if (error) return res.json({ error: error, data: null, meta: null }), tx.abort(), logger.routes.error(TAGS, error);
        if (result.rowCount === 0) { return res.error(errors.input.NOT_FOUND); }

        // fallback undefined inputs to current feelings and ensure defined inputs are boolean
        var currentFeelings = {
          isLiked:  result.rows[0].isLiked ? true : false,
          isWanted: result.rows[0].isWanted ? true : false,
          isTried:  result.rows[0].isTried ? true : false
        };
        inputs.isLiked  = (typeof inputs.isLiked == 'undefined') ? currentFeelings.isLiked : !!inputs.isLiked;
        inputs.isWanted = (typeof inputs.isWanted == 'undefined') ? currentFeelings.isWanted : !!inputs.isWanted;
        inputs.isTried  = (typeof inputs.isTried == 'undefined') ? currentFeelings.isTried : !!inputs.isTried;

        var query = sql.query('UPDATE products SET {updates} WHERE products.id=$id');
        query.updates = sql.fields();
        if (inputs.isLiked  != currentFeelings.isLiked)  { query.updates.add('likes = likes '+(inputs.isLiked ? '+' : '-')+' 1'); }
        if (inputs.isWanted != currentFeelings.isWanted) { query.updates.add('wants = wants '+(inputs.isWanted ? '+' : '-')+' 1'); }
        if (inputs.isTried  != currentFeelings.isTried)  { query.updates.add('tries = tries '+(inputs.isTried ? '+' : '-')+' 1'); }
        query.$('id', +req.param('productId') || 0);

        if (query.updates.fields.length === 0) {
          // no updates needed
          return res.noContent(), tx.abort();
        }

        // update the product count
        tx.query(query.toString(), query.$values, function(error, result) {
          if (error) return res.json({ error: error, data: null, meta: null }), tx.abort(), logger.routes.error(TAGS, error);

          var feelingsQueryFn = function(table, add) {
            return function(cb) {
              if (add) {
                tx.query('INSERT INTO "'+table+'" ("productId", "userId", "createdAt") SELECT $1, $2, now() WHERE NOT EXISTS (SELECT id FROM "'+table+'" WHERE "productId"=$1 AND "userId"=$2)', [+req.param('productId'), +req.session.user.id], cb);
              } else {
                tx.query('DELETE FROM "'+table+'" WHERE "productId"=$1 AND "userId"=$2', [+req.param('productId'), +req.session.user.id], cb);
              }
            };
          };

          // create/delete feelings
          var queries = [];
          if (inputs.isLiked  != currentFeelings.isLiked)  { queries.push(feelingsQueryFn('productLikes', inputs.isLiked)); }
          if (inputs.isWanted != currentFeelings.isWanted) { queries.push(feelingsQueryFn('productWants', inputs.isWanted)); }
          if (inputs.isTried  != currentFeelings.isTried)  { queries.push(feelingsQueryFn('productTries', inputs.isTried)); }
          async.series(queries, function(err, results) {
            if (error) return res.json({ error: error, data: null }), tx.abort(), logger.routes.error(TAGS, error);
            
            // end transaction
            tx.commit(function() {

              res.noContent();

              if (req.body.isLiked != null && req.body.isLiked != undefined){
                if (req.body.isLiked != currentFeelings.isLiked){
                  magic.emit(
                    'products.' + (req.body.isLiked ? '' : 'un') + 'like'
                  , req.session.user.id, req.param('productId'));
                }
              }

              if (req.body.isTried != null && req.body.isTried != undefined){
                if (req.body.isTried != currentFeelings.isTried){
                  magic.emit(
                    'products.' + (req.body.isTried ? '' : 'un') + 'try'
                  , req.session.user.id, req.param('productId'));
                }
              }

              if (req.body.isWanted != null && req.body.isWanted != undefined){
                if (req.body.isWanted != currentFeelings.isWanted){
                  magic.emit(
                    'products.' + (req.body.isWanted ? '' : 'un') + 'want'
                  , req.session.user.id, req.param('productId'));
                }
              }
            });
          });
        });
      });
    });
  });
};