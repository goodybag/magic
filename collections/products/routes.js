
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

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = utils.selectAsMap(products, req.fields)
      .from(products);

    // filter by businessId, if given as a path param
    if (req.param('businessId')) {
      query.where(products.businessId.equals(req.param('businessId')));
    }

    query = query.toQuery();

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows });
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
      + 'LEFT JOIN "productTags" '
        + 'ON products.id = "productTags"."productId"'
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

        if (tagsPushed.indexOf(p.tag) === -1){
          product.tags.push(p.tag);

          // Make sure we're not duplicating tags
          tagsPushed.push(p.tag);
        }
      }

      // remove the pre-extraction data
      delete product.categoryId;
      delete product.categoryName;
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

          // I keep getting cryptic errors with this
          // var query = productCategories.select(
          //   'count("productCategories"."id")'
          // ).where(
          //   productCategories.businessId.equals(
          //     req.body.businessId
          //   ).and(
          //     '"productCategories"."id" in ('
          //     + req.body.categories.join(', ')
          //     + ')'
          //   )
          // ).toQuery();

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

          // Don't worry about checking validity of tags anymore
          return done();

          // I keep getting cryptic errors with this
          // var query = productTags.select(
          //   'count("productTags"."id")'
          // ).where(
          //   productTags.businessId.equals(
          //     req.body.businessId
          //   ).and(
          //     '"productTags"."id" in ('
          //     + req.body.tags.join(', ')
          //     + ')'
          //   )
          // ).toQuery();

          var query = 'select count("productTags"."id") as count'
                    + ' from "productTags"'
                    + ' where "productTags"."businessId" = '
                    + req.body.businessId
                    + ' and "productTags"."tag" in (\''
                    + req.body.tags.join("', '")
                    + '\');';

          client.query(query, done);
        }

      }, function(error, results){
        if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

        if (checkCategories && results.categories.rows[0].count < req.body.categories.length)
          return res.json({ error: errors.input.INVALID_CATEGORY_IDS, data: null });

        // Don't worry about checking tag validity anymore
        // if (checkTags && results.tags.rows[0].count < req.body.tags.length)
        //   return res.json({ error: errors.input.INVALID_TAGS, data: null });

        return stage.insertProduct(client);
      });
    }

    // Validate and insert the provided product
  , insertProduct: function(client){
      // defaults
      if (!req.body.isEnabled) req.body.isEnabled = true;

      var error = utils.validate(req.body, db.schemas.products);
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      // We don't want to try and insert categories or tags
      var categories = req.body.categories;
      delete req.body.categories;

      var tags = req.body.tags;
      delete req.body.tags;

      var query = products.insert(req.body).toQuery();

      logger.db.debug(TAGS, query.text);

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
        isObj   = (categories.length > 0) ? !!categories[0].id : false

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
            var query = productTags.insert(values).toQuery();

            client.query(query.text, query.values, complete);
          };
        }
      ;

      // Queue up category query functions
      for (var i = categories.length - 1; i >= 0; i--){
        queries.push(
          getCategoryQueryFunction({
            productId: productId
          , productCategoryId: isObj ? categories[i].id : categories[i]
          })
        );
      }

      // Queue up tag query functions
      for (var i = tags.length - 1; i >= 0; i--) {
        queries.push(
          getTagQueryFunction({
            productId: productId
          , businessId: req.body.businessId
          , tag: tags[i]
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
  var
    TAGS            = ['update-product', req.uuid]

  , checkCategories = (req.body.categories && req.body.categories.length > 0)
  , checkTags       = (req.body.tags && req.body.tags.length > 0)
  ;

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
      if (!req.body.categories || req.body.categories.length === 0)
        return stage.updateProduct(client);

      var query = 'select pc.id from products p, "productCategories" pc where p."businessId" = pc."businessId" and p.id = ' + req.params.productId;

      client.query(query, function(error, results){
        if (error) return done(error);

        var categories = results.rows.map(function(a){ return a.id; });

        for (var i = req.body.categories.length - 1; i >= 0; i--){
          // Business does not have category
          if (categories.indexOf(req.body.categories[i]) === -1){
            res.json({ error: errors.input.INVALID_CATEGORY_IDS, data: null });
            return logger.routes.error(TAGS, errors.input.INVALID_CATEGORY_IDS);
          }
        }

        stage.updateProduct(client);
      });
    }

    // Validate and insert the provided product
  , updateProduct: function(client){
      // defaults
      if (!req.body.isEnabled) req.body.isEnabled = true;

      var error = utils.validate(req.body, db.schemas.products);
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      // We don't want to try and insert categories
      var categories = req.body.categories;
      delete req.body.categories;

      var tags = req.body.tags;
      delete req.body.tags;

      var query = products
        .update(req.body)
        .where(products.id.equals(req.param('productId')))
        .toQuery();

      logger.db.debug(TAGS, query.text);

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
            var query = productTags.delete().where(
              productTags.productId.equals(productId)
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
                  var query = productsProductCategories.insert(values).toQuery();

                  client.query(query, complete);
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
              // Array of functions to execute in parallel
              queries = []

              // Returns a function that executes a query to be executed in parallel via async
            , getTagQueryFunction = function(values){
                return function(complete){
                  var query = productTags.insert(values).toQuery();

                  client.query(query, complete);
                };
              }
            ;

            // Queue up query functions
            for (var i = tags.length - 1; i >= 0; i--){
              queries.push(
                getTagQueryFunction({
                  productId: productId
                , businessId: businessId
                , tag: tags[i]
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
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

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

