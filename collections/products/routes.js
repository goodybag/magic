
/*
 * Product resources
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}

  // Tables
, products                  = db.tables.products
, productTags               = db.tables.productTags
, productsProductTags       = db.tables.productsProductTags
, productCategories         = db.tables.productCategories
, productsProductCategories = db.tables.productsProductCategories
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
  logger.routes.debug(TAGS, 'fetching list of products', {uid: 'more'});

  // retrieve pg client
  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null, meta: null }), logger.routes.error(TAGS, error);

    // build data query
    var query = utils.selectAsMap(products, req.fields)
      .from(products);

    // filter by businessId, if given as a path param
    if (req.param('businessId')) {
      query.where(products.businessId.equals(req.param('businessId')));
    }
    query = utils.paginateQuery(req, query);

    // run data query
    client.query(query.toQuery(), function(error, dataResult){
      if (error) return res.json({ error: error, data: null, meta: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, dataResult);

      // run count query
      query = products.select('COUNT(*) as count');
      if (req.param('businessId')) {
        query.where(products.businessId.equals(req.param('businessId')));
      }
      client.query(query.toQuery(), function(error, countResult) {
        if (error) return res.json({ error: error, data: null, meta: null }), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: dataResult.rows, meta: { total:countResult.rows[0].count } });
      });
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
  logger.routes.debug(TAGS, 'fetching product', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = utils.selectAsMap(products, req.fields)
      // :DEBUG: node-sql cant support this yet
      /*.from(products
        .join(productsProductCategories)
          .on(productsProductCategories.productId.equals(products.id))
        .join(productCategories)
          .on(productCategories.id.equals(productsProductCategories.productCategoryId))
        )*/
      .from(' products '
      + 'LEFT JOIN "productsProductCategories" ppc '
        + 'ON ppc."productId" = products.id '
      + 'LEFT JOIN "productCategories" '
        + 'ON "productCategories".id = ppc."productCategoryId" '
      + 'LEFT JOIN "productsProductTags" ppt '
        + 'ON ppt."productId" = products.id '
      + 'LEFT JOIN "productTags" '
        + 'ON "productTags".id = ppt."productTagId"'
      )
      .where(products.id.equals(req.param('productId')))
      .toQuery();

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);
      if (result.rows.length <= 0) return res.json({ error: null, data: null});

      var
        product = result.rows[0]
      , catsPushed = []
      , tagsPushed = []
      ;

      // pull categories and tags out of the rows and into an embedded array
      product.categories = [];
      product.tags       = [];

      for (var i=0, ii=result.rows.length, p; i < ii; i++) {
        p = result.rows[i];

        if (catsPushed.indexOf(p.categoryId) === -1){
          product.categories.push({
            id:   p.categoryId
          , name: p.categoryName
          });

          // Make sure we're not duplicating categories
          catsPushed.push(p.categoryId);
        }

        if (tagsPushed.indexOf(p.tagId) === -1){
          product.tags.push({
            id:  p.tagId
          , tag: p.tag
          });

          // Make sure we're not duplicating tags
          tagsPushed.push(p.tagId);
        }
      }

      // remove the pre-extraction data
      delete product.categoryId;
      delete product.categoryName;
      delete product.tagId;
      delete product.tag;

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
        return res.json({ error: error, data: null });
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

          var query = 'select count("productCategories"."id") as count'
                    + ' from "productCategories"'
                    + ' where "productCategories"."businessId" = '
                    + req.body.businessId
                    + ' and "productCategories"."id" in ('
                    + req.body.categories.join(', ')
                    + ');';

          client.query(query, done);
        }

      , tags: function(done){
          if (!checkTags) return done();

          var query = 'select count("productTags"."id") as count'
                    + ' from "productTags"'
                    + ' where "productTags"."businessId" = '
                    + req.body.businessId
                    + ' and "productTags"."id" in ('
                    + req.body.tags.join(', ')
                    + ');';

          client.query(query, done);
        }

      }, function(error, results){
        if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

        if (checkCategories && results.categories.rows[0].count < req.body.categories.length)
          return res.error(errors.input.INVALID_CATEGORY_IDS);

        if (checkTags && results.tags.rows[0].count < req.body.tags.length)
          return res.error(errors.input.INVALID_TAGS);

        return stage.insertProduct(client);
      });
    }

    // Validate and insert the provided product
  , insertProduct: function(client){
      // defaults
      if (!req.body.isEnabled) req.body.isEnabled = true;
      req.body.likes = 0;
      req.body.wants = 0;
      req.body.trieds = 0;

      // validate
      var error = utils.validate(req.body, db.schemas.products);
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      // We don't want to try and insert categories or tags
      var categories = req.body.categories;
      delete req.body.categories;

      var tags = req.body.tags;
      delete req.body.tags;

      // build query
      var query = products.insert(req.body).toQuery();
      logger.db.debug(TAGS, query.text);

      // run query
      client.query(query.text + ' RETURNING id', query.values, function(error, results){
        if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

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
            var query = productsProductCategories.insert(values).toQuery();

            client.query(query.text, query.values, complete);
          };
        }
      , getTagQueryFunction = function(values){
          return function(complete){
            var query = productsProductTags.insert(values).toQuery();

            client.query(query.text, query.values, complete);
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

      // That's it!
      utils.parallel(queries, function(error, results){
        if (error) logger.routes.error(TAGS, error);
        return res.json({ error: error, data: { id: productId } });
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
        return res.json({ error: error, data: null });
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

          var query = 'SELECT COUNT("productCategories"."id") as count'
                    + ' FROM "productCategories"'
                    + ' INNER JOIN products on products."businessId" = "productCategories"."businessId" and products.id = '
                    + req.param('productId')
                    + ' WHERE "productCategories"."id" in ('
                    + req.body.categories.join(', ')
                    + ');';

          client.query(query, done);
        }

      , tags: function(done){
          if (!checkTags) return done();

          var query = 'SELECT COUNT("productTags"."id") as count'
                    + ' FROM "productTags"'
                    + ' INNER JOIN products on products."businessId" = "productTags"."businessId" and products.id = '
                    + req.param('productId')
                    + ' WHERE "productTags"."id" in ('
                    + req.body.tags.join(', ')
                    + ');';

          client.query(query, done);
        }

      }, function(error, results){
        if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

        if (checkCategories && results.categories.rows[0].count < req.body.categories.length)
          return res.error(errors.input.INVALID_CATEGORY_IDS);

        if (checkTags && results.tags.rows[0].count < req.body.tags.length)
          return res.error(errors.input.INVALID_TAGS);

        return stage.updateProduct(client);
      });
    }

    // Validate and insert the provided product
  , updateProduct: function(client){
      // defaults
      if (!req.body.isEnabled) req.body.isEnabled = true;
      delete req.body.likes;
      delete req.body.wants;
      delete req.body.trieds;

      // validate
      var error = utils.validate(req.body, db.schemas.products);
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      // We don't want to try and insert categories
      var categories = req.body.categories;
      delete req.body.categories;

      var tags = req.body.tags;
      delete req.body.tags;

      // build query
      var query = products
        .update(req.body)
        .where(products.id.equals(req.param('productId')))
        .toQuery();

      logger.db.debug(TAGS, query.text);

      // run query
      client.query(query.text + ' RETURNING "businessId"', query.values, function(error, results){
        if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

        // If they didn't provide categories or tags, stop here
        if (!categories && !tags)
          return res.json({ error: null, data: null });

        // Move on to next stage
        stage.removeCategoriesAndTags(client, req.param('productId'), results.rows[0].businessId, categories, tags);
      });
    }

  , removeCategoriesAndTags: function(client, productId, businessId, categories, tags){
      var
        inParallel = {
          categories: function(done){
            var query = productsProductCategories.delete().where(
              productsProductCategories.productId.equals(productId)
            ).toQuery();

            client.query(query, done);
          }
        , tags: function(done){
            var query = productsProductTags.delete().where(
              productsProductTags.productId.equals(productId)
            ).toQuery();

            client.query(query, done);
          }
        }

      , onComplete = function(error, results){
          if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

          stage.updateCategoriesTags(client, productId, businessId, categories, tags);
        }
      ;

      utils.parallel(inParallel, onComplete);
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
                  client.query(productsProductCategories.insert(values).toQuery(), complete);
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
                  client.query(productsProductTags.insert(values).toQuery(), complete);
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
          if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

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
    if (error){
      logger.routes.error(TAGS, error);
      return res.json({ error: error, data: null });
    }

    var query = products
      .delete()
      .where(products.id.equals(req.param('productId')))
      .toQuery();

    logger.db.debug(TAGS, query.text);

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

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
  logger.routes.debug(TAGS, 'fetching list of product\'s categories', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    // build query
    var query = utils.selectAsMap(productsProductCategories, req.fields)
      .from(productsProductCategories
        .join(productCategories)
          .on(productCategories.id.equals(productsProductCategories.productCategoryId))
        )
      .where(productsProductCategories.productId.equals(req.param('productId')))
      .toQuery();

    // run query
    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

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
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    // :TODO: make sure the product exists?
    // :TODO: make sure product categorys businessId is the same as products

    // validate
    var data = { productId:req.param('productId'), productCategoryId:req.body.id };
    var error = utils.validate(data, db.schemas.productsProductCategories);
    if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

    // build query
    var query = {
      text: 'INSERT INTO "productsProductCategories" ("productId", "productCategoryId") '+
              'SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM "productsProductCategories" WHERE "productId" = $1 AND "productCategoryId" = $2)' // create only if DNE
    , values: [data.productId, data.productCategoryId]
    }

    logger.db.debug(TAGS, query.text);

    // run query
    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

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
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    // :TODO: make sure the product exists?

    // validate
    var data = { productId:req.param('productId'), productCategoryId:req.param('categoryId') };
    var error = utils.validate(data, db.schemas.productsProductCategories);
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    // build query
    var query = productsProductCategories
      .delete()
      .where(productsProductCategories.productId.equals(data.productId))
      .and(productsProductCategories.productCategoryId.equals(data.productCategoryId))
      .toQuery();

    logger.db.debug(TAGS, query.text);

    // run query
    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

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

    // :TODO: make sure user is authenticated

    // validate
    var input = {
      productId : req.param('productId'),
      userId    : req.session.user.id,
      isLiked   : req.body.isLiked,
      isWanted  : req.body.isWanted,
      isTried   : req.body.isTried
    };
    var error = utils.validate(input, db.schemas.productsUsersFeelings);
    if (error) return res.error(errors.input.VALIDATION_FAILED, error), logger.routes.error(TAGS, error);

    // start the transaction
    var tx = new Transaction(client);
    tx.begin();

    // lock the product row and get the current feelings
    var query = [
      'SELECT products.id AS "productId", "productLikes".id as "isLiked", "productWants".id as "isWanted", "productTrieds".id as "isTried"',
      'FROM products',
      'LEFT JOIN "productLikes" ON "productLikes"."productId" = $1 AND "productLikes"."userId" = $2',
      'LEFT JOIN "productWants" ON "productWants"."productId" = $1 AND "productWants"."userId" = $2',
      'LEFT JOIN "productTrieds" ON "productTrieds"."productId" = $1 AND "productTrieds"."userId" = $2',
      'WHERE products.id = $1 FOR UPDATE OF products'
    ].join(' ');
    tx.query(query, [+req.param('productId'), +req.session.user.id], function(error, result) {
      if (error) return res.json({ error: error, data: null, meta: null }), tx.abort(), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) { return res.error(errors.input.NOT_FOUND); }

      // fallback inputs to current feelings
      var currentFeelings = result.rows[0];
      if (typeof input.isLiked == 'undefined') { input.isLiked = !!currentFeelings.isLiked; }
      if (typeof input.isWanted == 'undefined') { input.isWanted = !!currentFeelings.isWanted; }
      if (typeof input.isTried == 'undefined') { input.isTried = !!currentFeelings.isTried; }

      // build product changes
      var productChanges = [];
      if (input.isLiked  != !!currentFeelings.isLiked)  { productChanges.push('likes = likes '+(input.isLiked ? '+' : '-')+' 1'); }
      if (input.isWanted != !!currentFeelings.isWanted) { productChanges.push('wants = wants '+(input.isWanted ? '+' : '-')+' 1'); }
      if (input.isTried  != !!currentFeelings.isTried)  { productChanges.push('trieds = trieds '+(input.isTried ? '+' : '-')+' 1'); }
      productChanges = productChanges.join(', ');

      // update the product count
      tx.query('UPDATE products SET '+productChanges+' WHERE products.id=$1', [+req.param('productId')], function(error, result) {
        if (error) return res.json({ error: error, data: null, meta: null }), tx.abort(), logger.routes.error(TAGS, error);

        var feelingsQueryFn = function(table, add) {
          return function(cb) {
            if (add) {
              tx.query('INSERT INTO "'+table+'" ("productId", "userId") VALUES ($1, $2)', [+req.param('productId'), +req.session.user.id], cb);
            } else {
              tx.query('DELETE FROM "'+table+'" WHERE "productId"=$1 AND "userId"=$2', [+req.param('productId'), +req.session.user.id], cb);
            }
          };
        };

        // create/delete feelings
        var queries = [];
        if (input.isLiked  != !!currentFeelings.isLiked)  { queries.push(feelingsQueryFn('productLikes', input.isLiked)); }
        if (input.isWanted != !!currentFeelings.isWanted) { queries.push(feelingsQueryFn('productWants', input.isWanted)); }
        if (input.isTried  != !!currentFeelings.isTried)  { queries.push(feelingsQueryFn('productTrieds', input.isTried)); }
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
};