
/*
 * Product resources
 */

var
  db      = require('../../db')
, sql     = require('../../lib/sql')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

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
  db.getClient(function(error, client){
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

    // build data query
    var query = sql.query([
      'SELECT {fields} FROM products',
        '{locJoin} {tagJoin}',
        'INNER JOIN businesses ON businesses.id = products."businessId"',
        '{where}',
        'GROUP BY products.id, businesses.id',
        '{sort} {limit}'
    ]);
    query.fields = sql.fields().add('products.*').add('businesses.name as "businessName"');
    query.where  = sql.where();
    query.sort   = sql.sort(req.query.sort || '+name');
    query.limit  = sql.limit(req.query.limit, req.query.offset);

    // business filtering
    if (req.param('businessId')) { // use param() as this may come from the path or the query
      query.where.and('products."businessId" = $businessId');
      query.$('businessId', req.param('businessId'));
    }

    // location filtering
    if (req.query.lat && req.query.lon) {
      query.locJoin = [
        'INNER JOIN "productLocations" ON',
          '"productLocations"."productId" = products.id'
      ].join(' ')
      query.$('lat', req.query.lat);
      query.$('lon', req.query.lon);
      query.fields.add('min(earth_distance(ll_to_earth($lat,$lon), position)) AS distance')
      if (req.query.range) {
        query.locJoin += ' AND earth_box(ll_to_earth($lat,$lon), $range) @> ll_to_earth("productLocations".lat, "productLocations".lon)';
        query.$('range', req.query.range);
      }
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

    // tag include
    if (includeTags) {
      query.fields.add([
        'array_to_string(array(SELECT row("productTags".*) FROM "productTags"',
          'INNER JOIN "productsProductTags"',
            'ON "productsProductTags"."productTagId" = "productTags".id',
            'AND "productsProductTags"."productId" = products.id',
        '), \'\t\') as tags'
      ].join(' '));
    }

    // category include
    if (includeCats) {
      query.fields.add([
        'array_to_string(array(SELECT row("productCategories".*) FROM "productCategories"',
          'INNER JOIN "productsProductCategories"',
            'ON "productsProductCategories"."productCategoryId" = "productCategories".id',
            'AND "productsProductCategories"."productId" = products.id',
        '), \'\t\') as categories'
      ].join(' '));
    }

    // custom sorts
    if (req.query.sort) {
      if (req.query.sort.indexOf('random') !== -1)
        query.fields.add('random() as random'); // this is really inefficient
      else if (req.query.sort.indexOf('popular') !== -1)
        query.fields.add('random() as popular'); // :TODO:
    }

    query.fields.add('COUNT(*) OVER() as "metaTotal"');

    // run data query
    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);
      var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;

      // parse out embedded results
      if (includeTags || includeCats) {
        var tagColumns = Object.keys(schemas.productTags);
        var catColumns = Object.keys(schemas.productCategories);
        dataResult.rows.forEach(function(row) {
          if (typeof row.tags != 'undefined') {
            if (row.tags) {
              row.tags = row.tags
                .split('\t') // entries are separated by \t (not the actual tab character, funny enough)
                .map(function(tagRow) {
                  var tagData = tagRow
                    .slice(1,-1) // entries are surrounded by parens, so slice out
                    .split(','); // split into individual columns (and pray there are no commas in the dataset)
                  return utils.object(tagColumns, tagData);
                });
            } else {
              row.tags = [];
            }
          }
          if (typeof row.categories != 'undefined') {
            row.categories = row.categories
              .split('\t')
              .map(function(catRow) {
                var catData = catRow.slice(1,-1).split(',');
                return utils.object(catColumns, catData);
              });
          }
        });
      }

      return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
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

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'SELECT products.*, {fields}',
//        'array_to_json(array_agg(row_to_json("productCategories".*))) AS categories,',
//        'array_to_json(array_agg(row_to_json("productTags".*))) AS tags',
      'FROM products',
        'INNER JOIN businesses ON businesses.id = products."businessId"',
        'LEFT JOIN "productsProductCategories" ppc',
          'ON ppc."productId" = products.id',
        'LEFT JOIN "productCategories"',
          'ON "productCategories".id = ppc."productCategoryId"',
        'LEFT JOIN "productsProductTags" ppt',
          'ON ppt."productId" = products.id',
        'LEFT JOIN "productTags"',
          'ON "productTags".id = ppt."productTagId"',
        'WHERE products.id = $id',
        'GROUP BY products.id, businesses.id'
    ]);
    query.$('id', +req.param('productId') || 0);

    // :TEMP: hack around travis ci's lack of PG json support
    query.fields = sql.fields();
    query.fields.add('businesses.name as "businessName"')
    for (var tagColumn in schemas.productTags) {
      query.fields.add('array_agg("productTags"."'+tagColumn+'"::text) as "tag_'+tagColumn+'"');
    }
    for (var categoryColumn in schemas.productCategories) {
      query.fields.add('array_agg("productCategories"."'+categoryColumn+'"::text) as "cat_'+categoryColumn+'"');
    }

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      var product = result.rows[0];
      if (!product) return res.status(404).end();

      // :TEMP: hack to replace array_to_json and shit
      // create tags & cats objects
      var tags = [], cats = [];
      for (var i=0; i < product.tag_id.length; i++) { tags.push({}); }
      for (var i=0; i < product.cat_id.length; i++) { cats.push({}); }

      // extract data from row
      for (var col in schemas.productTags) {
        var k = 'tag_'+col;
        if (!product[k]) { continue; }
        product[k].forEach(function(v, i) { tags[i][col] = v; });
        delete product[k];
      }
      for (var col in schemas.productCategories) {
        var k = 'cat_'+col;
        if (!product[k]) { continue; }
        product[k].forEach(function(v, i) { cats[i][col] = v; });
        delete product[k];
      }
      // :TEMP: have to filter out null rows generated during aggregation-- is there a way to do that in the SQL?
      product.tags = tags.filter(function(t) { return !!t.id; });
      product.categories = cats.filter(function(c) { return !!c.id; });;

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
        checkCategories = (req.body.categories && req.body.categories.length > 0)
      , checkTags       = (req.body.tags && req.body.tags.length > 0)
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
          query.categoryIds = [].concat(req.body.categories).map(function(i) { return parseInt(i,10); }).join(',');
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
          query.tagIds = [].concat(req.body.tags).map(function(i) { return parseInt(i,10); }).join(',');
          client.query(query.toString(), query.$values, done);
        }

      }, function(error, results){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        if (checkCategories && results.categories.rows[0].count < req.body.categories.length)
          return res.error(errors.input.INVALID_CATEGORY_IDS);

        if (checkTags && results.tags.rows[0].count < req.body.tags.length)
          return res.error(errors.input.INVALID_TAGS);

        return stage.insertProduct(client);
      });

    }

    // Validate and insert the provided product
  , insertProduct: function(client){

      var inputs = req.body;
      if (!inputs.isEnabled) inputs.isEnabled = true;
      inputs.likes = 0;
      inputs.wants = 0;
      inputs.tries = 0;

      var categories = inputs.categories;
      var tags = inputs.tags;
      delete inputs.categories;
      delete inputs.tags;

      var error = utils.validate(inputs, db.schemas.products);
      if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

      var query = sql.query('INSERT INTO products ({fields}) VALUES ({values}) RETURNING id');
      query.fields = sql.fields().addObjectKeys(inputs);
      query.values = sql.fields().addObjectValues(inputs, query);
      logger.db.debug(TAGS, query.toString());

      // run query
      client.query(query.toString(), query.$values, function(error, results){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        // If they didn't provide categories or tags, stop here
        if ((!categories || categories.length === 0) && (!tags || tags.length === 0))
          return res.json({ error: null, data: results.rows[0] });

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
      , isTagObj  = (tags.length > 0) ? !!tags[0].id : false

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
        'INSERT INTO "productLocations" ("productId", "locationId", "businessId", lat, lon, position)',
          'SELECT $productId, locations.id, $businessId, locations.lat, locations.lon, ll_to_earth(locations.lat, locations.lon)',
            'FROM locations WHERE locations."businessId" = $businessId'
      ]);
      query.$('productId', productId);
      query.$('businessId', req.body.businessId);

      client.query(query.toString(), query.$values, function(error, result) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: { id: productId } });
      });
    }
  };

  // Kick it off
  db.getClient(stage.clientReceived);
};

/**
 * Update product
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-product', req.uuid];

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
        checkCategories = (req.body.categories && req.body.categories.length > 0)
      , checkTags       = (req.body.tags && req.body.tags.length > 0)
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
          query.categoryIds = [].concat(req.body.categories).map(function(i) { return parseInt(i,10); }).join(',');
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
          query.tagIds = [].concat(req.body.tags).map(function(i) { return parseInt(i,10); }).join(',');
          client.query(query.toString(), query.$values, done);
        }

      }, function(error, results){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        if (checkCategories && results.categories.rows[0].count < req.body.categories.length)
          return res.error(errors.input.INVALID_CATEGORY_IDS);

        if (checkTags && results.tags.rows[0].count < req.body.tags.length)
          return res.error(errors.input.INVALID_TAGS);

        return stage.updateProduct(client);
      });
    }

    // Validate and insert the provided product
  , updateProduct: function(client){
      var inputs = req.body;
      if (!inputs.isEnabled) inputs.isEnabled = true;
      delete inputs.likes;
      delete inputs.wants;
      delete inputs.tries;

      var categories = inputs.categories;
      var tags = inputs.tags;
      delete inputs.categories;
      delete inputs.tags;

      var error = utils.validate(inputs, db.schemas.products);
      if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

      var query = sql.query('UPDATE products SET {updates} WHERE id=$productId RETURNING "businessId"');
      query.updates = sql.fields().addUpdateMap(inputs, query);
      query.$('productId', +req.param('productId') || 0);

      logger.db.debug(TAGS, query.toString());

      client.query(query.toString(), query.$values, function(error, results){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        if (!categories && !tags)
          return res.json({ error: null, data: null });

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
              isObj = !!tags[0].id

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

          return res.json({ error: null, data: null });
        }
      ;

      utils.parallel(inParallel, onComplete);
    }
  };

  // Kick it off
  db.getClient(stage.clientReceived);
};

/**
 * Delete product
 * TODO: remove product category relations too
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.del = function(req, res){
  var TAGS = ['delete-product', req.uuid];

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('DELETE FROM products WHERE id=$productId');
    query.$('productId', +req.param('productId') || 0);

    logger.db.debug(TAGS, query.toString());

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
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

  db.getClient(function(error, client){
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

      logger.db.debug(TAGS, result);

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

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // :TODO: make sure the product exists?
    // :TODO: make sure product category's businessId is the same as products

    var inputs = { productId:req.param('productId'), productCategoryId:req.body.id };
    var error = utils.validate(inputs, db.schemas.productsProductCategories);
    if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'INSERT INTO "productsProductCategories" ("productId", "productCategoryId")',
        'SELECT $productId, $productCategoryId WHERE NOT EXISTS',
          '(SELECT 1 FROM "productsProductCategories"',
            'WHERE "productId" = $productId',
            'AND "productCategoryId" = $productCategoryId)'
    ]);
    query.$('productId', inputs.productId);
    query.$('productCategoryId', inputs.productCategoryId);

    logger.db.debug(TAGS, query.toString());

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
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

  db.getClient(function(error, client){
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

    logger.db.debug(TAGS, query.toString());

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
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

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var inputs = {
      productId : req.param('productId'),
      userId    : req.session.user.id,
      isLiked   : req.body.isLiked,
      isWanted  : req.body.isWanted,
      isTried   : req.body.isTried
    };
    var error = utils.validate(inputs, db.schemas.productsUsersFeelings);
    if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

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

        // fallback inputs to current feelings
        var currentFeelings = result.rows[0];
        if (typeof inputs.isLiked == 'undefined') { inputs.isLiked = !!currentFeelings.isLiked; }
        if (typeof inputs.isWanted == 'undefined') { inputs.isWanted = !!currentFeelings.isWanted; }
        if (typeof inputs.isTried == 'undefined') { inputs.isTried = !!currentFeelings.isTried; }

        var query = sql.query('UPDATE products SET {updates} WHERE products.id=$id');
        query.updates = sql.fields();
        if (inputs.isLiked  != !!currentFeelings.isLiked)  { query.updates.add('likes = likes '+(inputs.isLiked ? '+' : '-')+' 1'); }
        if (inputs.isWanted != !!currentFeelings.isWanted) { query.updates.add('wants = wants '+(inputs.isWanted ? '+' : '-')+' 1'); }
        if (inputs.isTried  != !!currentFeelings.isTried)  { query.updates.add('tries = tries '+(inputs.isTried ? '+' : '-')+' 1'); }
        query.$('id', +req.param('productId') || 0);

        if (query.updates.fields.length === 0) {
          // no updates needed
          return res.json({ data: null, meta: null }), tx.abort();
        }

        // update the product count
        tx.query(query.toString(), query.$values, function(error, result) {
          if (error) return res.json({ error: error, data: null, meta: null }), tx.abort(), logger.routes.error(TAGS, error);

          var feelingsQueryFn = function(table, add) {
            return function(cb) {
              if (add) {
                tx.query('INSERT INTO "'+table+'" ("productId", "userId") SELECT $1, $2 WHERE NOT EXISTS (SELECT id FROM "'+table+'" WHERE "productId"=$1 AND "userId"=$2)', [+req.param('productId'), +req.session.user.id], cb);
              } else {
                tx.query('DELETE FROM "'+table+'" WHERE "productId"=$1 AND "userId"=$2', [+req.param('productId'), +req.session.user.id], cb);
              }
            };
          };

          // create/delete feelings
          var queries = [];
          if (inputs.isLiked  != !!currentFeelings.isLiked)  { queries.push(feelingsQueryFn('productLikes', inputs.isLiked)); }
          if (inputs.isWanted != !!currentFeelings.isWanted) { queries.push(feelingsQueryFn('productWants', inputs.isWanted)); }
          if (inputs.isTried  != !!currentFeelings.isTried)  { queries.push(feelingsQueryFn('productTries', inputs.isTried)); }
          async.series(queries, function(err, results) {
              if (error) return res.json({ error: error, data: null }), tx.abort(), logger.routes.error(TAGS, error);
              logger.db.debug(TAGS, result);

              // end transaction
              tx.commit();

              return res.json({ error: null, data: null });
          });
        });
      });
    });
  });
};
