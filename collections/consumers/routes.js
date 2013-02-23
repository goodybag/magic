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

  db.getClient(TAGS[0], function(error, client) {
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
      logger.db.debug(TAGS, result);

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

  db.getClient(TAGS[0], function(error, client){
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
      logger.db.debug(TAGS, dataResult);

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
  logger.routes.debug(TAGS, 'creating consumer ' + req.params.userId);

  db.procedures.registerConsumer(req.body, function(error, consumer){
    if (error) return res.error(error), logger.routes.error(TAGS, error);

    // Log the user in
    req.session.user = consumer;
    res.json({ error: null, data: consumer });

    magic.emit('consumers.registered', consumer);
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

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('DELETE FROM users WHERE users.id = $id');
    query.$('id', +req.params.userId || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) return res.status(404).end();

      logger.db.debug(TAGS, result);

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

  if (!req.session || !req.session.user)
    return res.error(errors.auth.NOT_AUTHENTICATED), logger.routes.error(TAGS, errors.auth.NOT_AUTHENTICATED);

  db.procedures.ensureNotTaken(req.body, req.param('userId'), function(error){
    if (error) return res.error(error), logger.routes.error(TAGS, error);

    var query = { userId:req.param('userId') };
    if (req.param('userId') == 'session')
      query.userId = req.session.user.id;

    db.api.consumers.findOne(query, { fields: ['"userId"'] }, function(error, consumer){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (!consumer)
        return res.error(errors.input.NOT_FOUND), logger.routes.error(TAGS, errors.input.NOT_FOUND);

      db.getClient(TAGS[0], function(error, client){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        var tx = new Transaction(client);

        tx.begin(function(error){
          if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

          var updateConsumerRecord = function(callback){
            var updateConsumer = false, data = {};

            // Determine if we even need to update the consumer record
            for (var i = db.fields.consumers.plain.length - 1; i >= 0; i--){
              if (db.fields.consumers.plain[i] in req.body){
                updateConsumer = true;
                data[db.fields.consumers.plain[i]] = req.body[db.fields.consumers.plain[i]];
              }
            }

            if (!updateConsumer) return callback();

            var query = sql.query('UPDATE consumers SET {updates} WHERE "userId"=$id');
            query.updates = sql.fields().addUpdateMap(data, query);
            query.$('id', consumer.userId);

            logger.db.debug(TAGS, query.toString());

            // run update query
            tx.query(query.toString(), query.$values, function(error, result){
              if (error) return callback(error);
              logger.db.debug(TAGS, result);

              // did the update occur?
              if (result.rowCount === 0)
                return callback(errors.input.NOT_FOUND);

              callback();
            });
          };

          var updateUserRecord = function(callback){
            var updateUser = false, data = {};

            // Determine if we even need to update the user record
            for (var i = db.fields.users.plain.length - 1; i >= 0; i--){
              if (db.fields.users.plain[i] in req.body){
                updateUser = true;
                data[db.fields.users.plain[i]] = req.body[db.fields.users.plain[i]];
              }
            }

            if (!updateUser) return callback();

            var query = sql.query('UPDATE users SET {updates} WHERE id=$id');

            query.updates = sql.fields().addUpdateMap(data, query);
            query.$('id', consumer.userId);

            logger.db.debug(TAGS, query.toString());

            // run update query
            tx.query(query.toString(), query.$values, function(error, result){
              if (error) return callback(error);
              logger.db.debug(TAGS, result);

              // did the update occur?
              if (result.rowCount === 0)
                return callback(errors.input.NOT_FOUND);

              return callback();
            });
          };

          utils.parallel({
            consumer: updateConsumerRecord
          , user:     updateUserRecord
          }, function(error, results){
            if (error){
              tx.abort();
              if (error.name === "DB_FAILURE"){
                res.error(errors.internal.DB_FAILURE, error);
              } else {
                res.error(error);
              }

              return logger.routes.error(TAGS, error);
            }

            tx.commit(function(error){
              if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

              res.noContent();
            });
          });
        });
      });
    });
  });
};

/**
 * Update consumer password
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.updatePassword = function(req, res){
  var TAGS = ['update-consumer-password', req.uuid];

  if (!req.session || !req.session.user)
    return res.error(errors.auth.NOT_AUTHENTICATED), logger.routes.error(TAGS, errors.auth.NOT_AUTHENTICATED);

  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic') !== 0)
    return res.error(errors.auth.NOT_AUTHENTICATED, 'Please include the current email and password in a basic authorization header'), logger.routes.error(TAGS, errors.auth.NOT_AUTHENTICATED);
  var token = new Buffer(req.headers.authorization.split(/\s+/).pop() || '', 'base64').toString();
  var oldPassword = token.split(/:/).pop();

  db.getClient(TAGS[0], function(error, client){
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

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = sql.query([
      'SELECT {fields} FROM collections',
        'LEFT JOIN "productsCollections" ON "productsCollections"."collectionId" = collections.id',
        'LEFT JOIN products ON products.id = "productsCollections"."productId" AND "photoUrl" IS NOT NULL',
        '{feelingsJoin}',
        'WHERE collections."userId" = $userId',
        'GROUP BY collections.id {limit}'
    ]);
    query.fields = sql.fields()
      .add("collections.*")
      .add('COUNT("productsCollections".id) as "numProducts"')
      .add('MIN(products."photoUrl") as "photoUrl"');
    query.where  = sql.where();
    query.limit  = sql.limit(req.query.limit, req.query.offset);
    query.$('userId', userId);

    if (req.session.user) {
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

    query.fields.add('COUNT(*) OVER() as "metaTotal"');

    // run data query
    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, dataResult);

      var meta = { total:0 };
      if (dataResult.rowCount) {
        meta.total = dataResult.rows[0].metaTotal;
      }

      return res.json({ error: null, data: dataResult.rows, meta: meta });
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

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('INSERT INTO collections ("userId", name) VALUES ($userId, $name) RETURNING id');
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
  var TAGS = ['get-consumer-collections', req.uuid];
  logger.routes.debug(TAGS, 'fetching consumer ' + req.params.userId + ' collection ' + req.param('collectionId'));

  var userId = req.param('userId');
  var collectionId = req.param('collectionId');

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = sql.query([
      'SELECT {fields} FROM collections',
        'LEFT JOIN "productsCollections" ON "productsCollections"."collectionId" = collections.id',
        'LEFT JOIN products ON products.id = "productsCollections"."productId" AND "photoUrl" IS NOT NULL',
        '{feelingsJoin}',
        'WHERE collections."userId" = $userId',
          'AND collections.id = $collectionId',
        'GROUP BY collections.id {limit}'
    ]);
    query.fields = sql.fields()
      .add("collections.*")
      .add('COUNT("productsCollections".id) as "numProducts"')
      .add('MIN(products."photoUrl") as "photoUrl"');
    query.where  = sql.where();
    query.limit  = sql.limit(req.query.limit, req.query.offset);
    query.$('userId', userId);
    query.$('collectionId', collectionId);

    if (req.session.user) {
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

    query.fields.add('COUNT(*) OVER() as "metaTotal"');

    // run data query
    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, dataResult);

      if (dataResult.rowCount === 0)
        return res.error(errors.input.NOT_FOUND);

      return res.json({ error: null, data: dataResult.rows[0] });
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

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('UPDATE collections SET name=$name WHERE id=$id AND "isHidden" is not true');
    query.$('id', collectionId);
    query.$('name', name);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) return res.error(errors.auth.INVALID_WRITE_PERMISSIONS);

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

  db.api.collections.remove(req.param('collectionId'), function(error){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    res.noContent();
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

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('INSERT INTO "productsCollections" ("collectionId", "productId", "userId", "createdAt") VALUES ($collectionId, $productId, $userId, now()) RETURNING id');
    query.$('userId', req.params.userId);
    query.$('collectionId', collectionId);
    query.$('productId', productId);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      res.json({ error: null, data: { id:result.rows[0].id }});

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

  var collectionId = req.param('collectionId');
  var productId = req.param('productId');

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('DELETE FROM "productsCollections" WHERE "collectionId"=$collectionId AND "productId"=$productId');
    query.$('collectionId', collectionId);
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

  db.getClient(TAGS[0], function(error, client){
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

  db.getClient(TAGS[0], function(error, client){
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