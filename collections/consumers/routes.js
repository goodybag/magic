/**
 * Consumers
 */

var
  singly  = require('singly')

, db      = require('../../db')
, utils   = require('../../lib/utils')
, magic   = require('../../lib/magic')
, errors  = require('../../lib/errors')
, config  = require('../../config')
, templates = require('../../templates')
, Transaction = require('pg-transaction')

, logger  = {}
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

/**
 * Get consumer
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-consumers', req.uuid];
  logger.routes.debug(TAGS, 'fetching consumer ' + req.params.userId);

  db.getClient(TAGS, function(error, client) {
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'SELECT {fields} FROM users',
        'LEFT JOIN "consumers" ON "consumers"."userId" = users.id',
        'WHERE users.id = $id'
    ]);
    query.fields = sql.fields().add("users.*, consumers.*");
    query.$('id', +req.param('userId') || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (result.rowCount == 1) {
        return res.json({ error: null, data: result.rows[0] });
      } else {
        return res.status(404).end();
      }
    });
  });
};

/**
 * List consumers
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-consumers', req.uuid];
  logger.routes.debug(TAGS, 'fetching consumers ' + req.params.userId);

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = sql.query([
      'SELECT {fields} FROM consumers',
        'INNER JOIN users ON consumers."userId" = users.id',
        '{where} {limit}'
    ]);
    query.fields = sql.fields().add("users.*, consumers.*");
    query.where  = sql.where();
    query.limit  = sql.limit(req.query.limit, req.query.offset);

    if (req.param('filter')) {
      query.where.and('users.email ILIKE $emailFilter');
      query.$('emailFilter', '%'+req.param('filter')+'%');
    }

    query.fields.add('COUNT(*) OVER() as "metaTotal"');

    // run data query
    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
      return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
    });
  });
};

/**
 * Create consumers
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-consumers', req.uuid];
  logger.routes.debug(TAGS, 'creating consumer');

  db.procedures.setLogTags(TAGS);
  db.procedures.registerUser('consumer', req.body, function(error, result){
    if (error) return res.error(error, result), logger.routes.error(TAGS, result);

    // Log the user in
    if (!req.session || !req.session.user)
      req.session.user = result;
    res.json({ error: null, data: result });

    magic.emit('consumers.registered', result);
  });
};

/**
 * Delete consumer
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-consumer', req.uuid];
  logger.routes.debug(TAGS, 'deleting consumer ' + req.params.userId);

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('DELETE FROM users WHERE users.id = $id');
    query.$('id', +req.params.userId || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) return res.status(404).end();

      res.noContent();
    });
  });
};

/**
 * Update consumer
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-consumer', req.uuid];
  logger.routes.debug(TAGS, 'updating consumer ' + req.params.userId);

  var userId = req.param('userId');
  if (req.param('userId') == 'session')
    userId = req.session.user.id;

  db.procedures.setLogTags(TAGS);
  db.procedures.updateUser('consumer', userId, req.body, function(error, result) {
    if (error) return res.error(error, result), logger.routes.error(TAGS, result);
    res.noContent();
  });
};

/**
 * Update consumer password
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.updatePassword = function(req, res){
  var TAGS = ['update-consumer-password', req.uuid];
  logger.routes.debug(TAGS, 'updating password for consumer ' + req.params.userId);

  if (!req.session || !req.session.user)
    return res.error(errors.auth.NOT_AUTHENTICATED), logger.routes.error(TAGS, errors.auth.NOT_AUTHENTICATED);

  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic') !== 0)
    return res.error(errors.auth.NOT_AUTHENTICATED, 'Please include the current email and password in a basic authorization header'), logger.routes.error(TAGS, errors.auth.NOT_AUTHENTICATED);
  var token = new Buffer(req.headers.authorization.split(/\s+/).pop() || '', 'base64').toString();
  var oldPassword = token.split(/:/).pop();

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var tx = new Transaction(client);

    tx.begin(function(error){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var query = sql.query('SELECT * FROM users WHERE id=$id FOR UPDATE OF users');
      query.$('id', (req.param('userId') == 'session') ? req.session.user.id : req.param('userId'));

      tx.query(query.toString(), query.$values, function(error, result) {
        if (error) return tx.abort(), res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        var user = result.rows[0];
        if (!user)
          return tx.abort(), res.error(errors.input.NOT_FOUND), logger.routes.error(TAGS, errors.input.NOT_FOUND);

        utils.comparePasswords(oldPassword, user.password, function(error, isValidPassword) {
          if (!isValidPassword)
            return tx.abort(), res.error(errors.auth.INVALID_PASSWORD);

          utils.encryptPassword(req.body.password, function(error, encryptedNewPW, newSalt) {
            var query = sql.query('UPDATE users SET password=$password, "passwordSalt"=$salt WHERE id=$id');
            query.$('password', encryptedNewPW);
            query.$('salt', newSalt);
            query.$('id', user.id);

            tx.query(query.toString(), query.$values, function(error, result) {
              if (error)
                return tx.abort(), res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
              if (result.rowCount === 0)
                return tx.abort(), res.error(errors.internal.DB_FAILURE, 'User record failed to update password, even after locking for transaction!'), logger.routes.error(TAGS, 'User record failed to update password, even after locking for transaction!');
              tx.commit(function() { res.noContent(); });
            });
          });
        });
      });
    });
  });
};

/**
 * List consumer collections
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.listCollections = function(req, res){
  var TAGS = ['list-consumer-collections', req.uuid];
  logger.routes.debug(TAGS, 'fetching consumer ' + req.params.userId + ' collections');

  var userId = req.param('userId');
  var showHidden = req.param('showHidden') || false;
  var limit = req.param('limit');
  var offset = req.param('offset');

  // update the limit and offset to counter for the injected "All" collection
  var shouldInjectAll = (typeof offset == "undefined" || offset === 0);
  if (shouldInjectAll) {
    offset--; // don't need to skip "all" in the DB query
    limit--; // need to make room for "all"
  }

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = sql.query([
      'SELECT {fields} FROM collections',
        'LEFT JOIN "productsCollections" ON "productsCollections"."collectionId" = collections.id',
        'LEFT JOIN products ON products.id = "productsCollections"."productId" AND "photoUrl" IS NOT NULL',
        '{feelingsJoin}',
        '{where}',
        'GROUP BY collections.id {limit}'
    ]);
    query.fields = sql.fields()
      .add('(CASE WHEN collections."pseudoKey" IS NOT NULL THEN collections."pseudoKey" ELSE collections.id::text END) AS id')
      .add('collections."userId"')
      .add('collections.name')
      .add('collections."isHidden"')
      .add('COUNT("productsCollections".id) as "numProducts"')
      .add('MIN(products."photoUrl") as "photoUrl"');
    query.limit = sql.limit(limit, offset);
    query.where = sql.where('collections."userId" = $userId');
    query.$('userId', userId);

    if (!showHidden)
      query.where.and('collections."isHidden" is false');

    if (req.session.user && userId == req.session.user.id) {
      query.feelingsJoin = [
        'LEFT JOIN "productLikes" ON "productLikes"."productId" = "productsCollections"."productId" AND "productLikes"."userId" = $userId',
        'LEFT JOIN "productWants" ON "productWants"."productId" = "productsCollections"."productId" AND "productWants"."userId" = $userId',
        'LEFT JOIN "productTries" ON "productTries"."productId" = "productsCollections"."productId" AND "productTries"."userId" = $userId'
      ].join(' ');
      query.fields
        .add('COUNT("productLikes".id) as "totalMyLikes"')
        .add('COUNT("productWants".id) as "totalMyWants"')
        .add('COUNT("productTries".id) as "totalMyTries"');
    }

    query.fields.add('COUNT(*) OVER() as "metaTotal"');

    // run data query
    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var meta = { total:0 };
      if (dataResult.rows[0]) {
        meta.total = dataResult.rows[0].metaTotal + 1; // +1 for the "all" psuedo-collection that we add
      }

      if (!shouldInjectAll)
        return res.json({ error: null, data: dataResult.rows, meta: meta });

      // build aggregate query
      var query = sql.query([
        'WITH agg AS',
          '(SELECT DISTINCT ON ("productsCollections"."productId") {selfields}',
            'FROM "productsCollections" INNER JOIN collections',
              'ON "productsCollections"."collectionId" = collections.id',
              'AND collections."userId" = $userId',
            '{feelingsJoin})',
        'SELECT {aggfields} FROM "agg"'
      ]);
      query.selfields = sql.fields().add('"productsCollections".*');
      query.aggfields = sql.fields().add('COUNT("agg".id) AS "numProducts"');
      query.$('userId', userId);

      if (req.session.user && userId == req.session.user.id) {
        query.feelingsJoin = [
          'LEFT JOIN "productLikes" ON "productLikes"."productId" = "productsCollections"."productId" AND "productLikes"."userId" = $userId',
          'LEFT JOIN "productWants" ON "productWants"."productId" = "productsCollections"."productId" AND "productWants"."userId" = $userId',
          'LEFT JOIN "productTries" ON "productTries"."productId" = "productsCollections"."productId" AND "productTries"."userId" = $userId'
        ].join(' ');
        query.selfields
          .add('"productLikes".id as "productLikesId"')
          .add('"productWants".id as "productWantsId"')
          .add('"productTries".id as "productTriesId"');
        query.aggfields
          .add('COUNT("agg"."productLikesId") as "totalMyLikes"')
          .add('COUNT("agg"."productWantsId") as "totalMyWants"')
          .add('COUNT("agg"."productTriesId") as "totalMyTries"');
      }

      client.query(query.toString(), query.$values, function(error, aggResult){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        // add "all" psuedo-collection
        var all = {
          id           : 'all',
          userId       : userId,
          name         : 'All',
          isHidden     : false,
          numProducts  : (aggResult.rows[0]) ? aggResult.rows[0].numProducts : 0,
          photoUrl     : '', // :TODO:
          totalMyLikes : (aggResult.rows[0]) ? aggResult.rows[0].totalMyLikes : 0,
          totalMyWants : (aggResult.rows[0]) ? aggResult.rows[0].totalMyWants : 0,
          totalMyTries : (aggResult.rows[0]) ? aggResult.rows[0].totalMyTries : 0
        };
        dataResult.rows = [all].concat(dataResult.rows);

        return res.json({ error: null, data: dataResult.rows, meta: meta });
      });
    });
  });
};

/**
 * Create consumer collection
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.createCollection = function(req, res){
  var TAGS = ['create-consumers-collection', req.uuid];
  logger.routes.debug(TAGS, 'creating consumer ' + req.params.userId + ' collection');

  var userId = req.param('userId');
  var name = req.body.name;

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('INSERT INTO collections ("userId", name, "isHidden") VALUES ($userId, $name, false) RETURNING id');
    query.$('userId', userId);
    query.$('name', name);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      res.json({ error: null, data: { id:result.rows[0].id }});
    });
  });
};

/**
 * Get consumer collection
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.getCollection = function(req, res){
  var TAGS = ['get-consumer-collection', req.uuid];
  logger.routes.debug(TAGS, 'fetching consumer ' + req.params.userId + ' collection ' + req.param('collectionId'));

  var userId = req.param('userId');
  var collectionId = req.param('collectionId');

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = sql.query([
      'SELECT {fields} FROM collections',
        'LEFT JOIN "productsCollections" ON "productsCollections"."collectionId" = collections.id',
        'LEFT JOIN products ON products.id = "productsCollections"."productId" AND "photoUrl" IS NOT NULL',
        '{feelingsJoin}',
        'WHERE collections."userId" = $userId',
          'AND (collections.id::text = $collectionId OR collections."pseudoKey" = $collectionId)',
        'GROUP BY collections.id {limit}'
    ]);
    query.fields = sql.fields()
      .add('(CASE WHEN collections."pseudoKey" IS NOT NULL THEN collections."pseudoKey" ELSE collections.id::text END) AS id')
      .add('collections."userId"')
      .add('collections.name')
      .add('collections."isHidden"')
      .add('COUNT("productsCollections".id) as "numProducts"')
      .add('MIN(products."photoUrl") as "photoUrl"');
    query.where  = sql.where();
    query.limit  = sql.limit(req.query.limit, req.query.offset);
    query.$('userId', userId);
    query.$('collectionId', collectionId);

    if (req.session.user && userId == req.session.user.id) {
      query.feelingsJoin = [
        'LEFT JOIN "productLikes" ON "productLikes"."productId" = "productsCollections"."productId" AND "productLikes"."userId" = $userId',
        'LEFT JOIN "productWants" ON "productWants"."productId" = "productsCollections"."productId" AND "productWants"."userId" = $userId',
        'LEFT JOIN "productTries" ON "productTries"."productId" = "productsCollections"."productId" AND "productTries"."userId" = $userId'
      ].join('');
      query.fields
      .add('COUNT("productLikes".id) as "totalMyLikes"')
      .add('COUNT("productWants".id) as "totalMyWants"')
      .add('COUNT("productTries".id) as "totalMyTries"');
      query.$('userId', req.session.user.id);
    }

    // run data query
    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (dataResult.rowCount === 0)
        return res.error(errors.input.NOT_FOUND);

      return res.json({ error: null, data: dataResult.rows[0] });
    });
  });
};

/**
 * Get consumer "All" collection
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.getAllCollection = function(req, res){
  var TAGS = ['get-consumer-all-collection', req.uuid];
  logger.routes.debug(TAGS, 'fetching consumer ' + req.params.userId + ' collection "all"');

  var userId = req.param('userId');

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = sql.query([
      'WITH agg AS',
        '(SELECT DISTINCT ON ("productsCollections"."productId") {selfields}',
          'FROM "productsCollections" INNER JOIN collections',
              'ON "productsCollections"."collectionId" = collections.id',
              'AND collections."userId" = $userId',
          '{feelingsJoin})',
      'SELECT {aggfields} FROM "agg"'
    ]);
    query.selfields = sql.fields().add('"productsCollections".*');
    query.aggfields = sql.fields().add('COUNT("agg".id) AS "numProducts"');
    query.$('userId', userId);

    if (req.session.user && userId == req.session.user.id) {
      query.feelingsJoin = [
        'LEFT JOIN "productLikes" ON "productLikes"."productId" = "productsCollections"."productId" AND "productLikes"."userId" = $userId',
        'LEFT JOIN "productWants" ON "productWants"."productId" = "productsCollections"."productId" AND "productWants"."userId" = $userId',
        'LEFT JOIN "productTries" ON "productTries"."productId" = "productsCollections"."productId" AND "productTries"."userId" = $userId'
      ].join(' ');
      query.selfields
        .add('"productLikes".id as "productLikesId"')
        .add('"productWants".id as "productWantsId"')
        .add('"productTries".id as "productTriesId"');
      query.aggfields
        .add('COUNT("agg"."productLikesId") as "totalMyLikes"')
        .add('COUNT("agg"."productWantsId") as "totalMyWants"')
        .add('COUNT("agg"."productTriesId") as "totalMyTries"');
    }

    // run data query
    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (dataResult.rowCount === 0)
        return res.error(errors.input.NOT_FOUND);

      var all = {
        id           : 'all',
        userId       : userId,
        name         : 'All',
        isHidden     : false,
        numProducts  : (dataResult.rows[0]) ? dataResult.rows[0].numProducts : 0,
        photoUrl     : '', // :TODO:
        totalMyLikes : (dataResult.rows[0]) ? dataResult.rows[0].totalMyLikes : 0,
        totalMyWants : (dataResult.rows[0]) ? dataResult.rows[0].totalMyWants : 0,
        totalMyTries : (dataResult.rows[0]) ? dataResult.rows[0].totalMyTries : 0
      };

      return res.json({ error: null, data: all });
    });
  });
};

/**
 * Update consumer collection
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.updateCollection = function(req, res){
  var TAGS = ['update-consumers-collection', req.uuid];
  logger.routes.debug(TAGS, 'updating consumer ' + req.params.userId + ' collection ' + req.params.collectionId);

  var collectionId = req.param('collectionId');
  var name = req.body.name;

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('UPDATE collections SET name=$name WHERE id::text=$id OR "pseudoKey"=$id');
    query.$('id', collectionId);
    query.$('name', name);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      res.noContent();
    });
  });
};

/**
 * Delete consumer collection
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.deleteCollection = function(req, res){
  var TAGS = ['delete-consumers-collection', req.uuid];
  logger.routes.debug(TAGS, 'deleting collection ' + req.params.collectionId);

  var collectionId = req.param('collectionId');

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('DELETE FROM collections WHERE id::text=$id OR "pseudoKey"=$id');
    query.$('id', collectionId);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      res.noContent();
    });
  });
};

/**
 * Add product to consumer collection
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.addCollectionProduct = function(req, res){
  var TAGS = ['add-consumers-collection-product', req.uuid];
  logger.routes.debug(TAGS, 'adding product to consumer ' + req.params.userId + ' collection');

  var collectionId = req.param('collectionId');
  var productId = req.body.productId;

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'WITH "collection" AS (SELECT collections.id FROM collections WHERE (collections.id::text = $collectionId OR collections."pseudoKey" = $collectionId) AND collections."userId" = $userId)',
      'INSERT INTO "productsCollections" ("productId", "userId", "createdAt", "collectionId")',
        'SELECT $productId, $userId, now(), "collection".id FROM "collection"',
          'WHERE NOT EXISTS (SELECT 1 FROM "productsCollections" WHERE "productId"=$productId AND "collectionId"="collection".id) RETURNING id'
    ]);
    query.$('userId', req.params.userId);
    query.$('collectionId', collectionId);
    query.$('productId', productId);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      res.noContent();

      magic.emit('consumers.addToCollection', req.params.userId || req.session.user.id, collectionId, productId);
    });
  });
};

/**
 * Remove product from consumer collection
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.removeCollectionProduct = function(req, res){
  var TAGS = ['remove-consumers-collection-product', req.uuid];
  logger.routes.debug(TAGS, 'removing product ' + req.params.productId + ' from consumer ' + req.params.userId + ' collection');

  var userId = req.param('userId');
  var collectionId = req.param('collectionId');
  var productId = req.param('productId');

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query;

    if (collectionId == 'all') { // delete from all collections
      query = sql.query([
        'DELETE FROM "productsCollections" USING collections',
          'WHERE "productId"=$productId',
            'AND "productsCollections"."collectionId" = collections.id',
            'AND "productsCollections"."userId" = $userId'
      ]);
      query.$('userId', userId);
    } else if (parseInt(collectionId,10) != collectionId) { // at least partly alpha, must be the pseudokey
      query = sql.query([
        'DELETE FROM "productsCollections" USING collections',
          'WHERE "productsCollections"."collectionId" = collections.id',
            'AND collections."pseudoKey" = $collectionId',
            'AND "productsCollections"."productId" = $productId'
      ]);
      query.$('collectionId', collectionId);
    } else { // fully numeric, must be the id
      query = sql.query('DELETE FROM "productsCollections" WHERE "collectionId"=$collectionId AND "productId"=$productId');
      query.$('collectionId', collectionId);
    }
    query.$('productId', productId);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      res.noContent();

      magic.emit('consumers.removeFromCollection', req.params.userId || req.session.user.id, collectionId, productId);
    });
  });
};

/**
 * Create consumer cardupdate
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.createCardupdate = function(req, res){
  var TAGS = ['create-consumer-cardupdate-token', req.uuid];
  logger.routes.debug(TAGS, 'creating consumer cardupdate token');

  var email = req.body.email;
  var newCardId = req.body.cardId;

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = 'SELECT users.id, users."cardId" FROM users WHERE users.email = $1';
    client.query(query, [email], function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) return res.error(errors.input.NOT_FOUND);
      var userId = result.rows[0].id;
      var oldCardId  = result.rows[0].cardId;

      var token = require("randomstring").generate();
      var query = sql.query([
        'INSERT INTO "consumerCardUpdates" ("userId", "newCardId", "oldCardId", token, expires, "createdAt")',
          'VALUES ($userId, $newCardId, $oldCardId, $token, now() + \'2 weeks\'::interval, now())'
      ]);
      query.$('userId', userId);
      query.$('newCardId', newCardId);
      query.$('oldCardId', oldCardId);
      query.$('token', token);
      client.query(query.toString(), query.$values, function(error, result) {
        if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        var emailHtml = templates.email.cardupdate({
          url : config.baseUrl + '/v1/consumers/cardupdate/' + token
        });
        utils.sendMail(email, config.emailFromAddress, 'Goodybag Assign New Card Link', emailHtml);

        if (req.session.user && req.session.user.groups.indexOf('admin') !== -1)
          res.json({ err:null, data:{ token:token }});
        else
          res.noContent();
      });
    });
  });
};

/**
 * Assign a new card to an existing user
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.updateCard = function(req, res){
  var TAGS = ['update-consumer-card', req.uuid];
  logger.routes.debug(TAGS, 'changing consumer card');

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // get cardupdate info
    client.query('SELECT "userId", "newCardId" FROM "consumerCardUpdates" WHERE token=$1 AND expires > now()', [req.params.token], function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) {
        return res.error(errors.input.VALIDATION_FAILED, 'Your card-update token was not found or has expired. Please request a new one.');
      }
      var targetConsumerId = result.rows[0].userId;
      var newCardId = result.rows[0].newCardId;

      client.query('UPDATE users SET "cardId"=$1 WHERE id = $2', [newCardId, targetConsumerId], function(error, result) {
        if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        res.noContent();
      });
    });
  });
};