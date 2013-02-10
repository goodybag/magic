/**
 * Consumers
 */

var
  singly  = require('singly')

  db      = require('../../db')
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
  logger.routes.debug(TAGS, 'fetching consumer ' + req.params.consumerId);

  db.getClient(TAGS[0], function(error, client) {
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'SELECT {fields} FROM users',
        'LEFT JOIN "consumers" ON "consumers"."userId" = users.id',
        'WHERE consumers.id = $id'
    ]);
    query.fields = sql.fields().add("users.*, consumers.*");
    query.$('id', +req.param('consumerId') || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      if (result.rowCount == 1) {
        result.rows[0].consumerId = result.rows[0].id;
        delete result.rows[0].id;

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
  logger.routes.debug(TAGS, 'fetching consumers ' + req.params.consumerId);

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
  logger.routes.debug(TAGS, 'creating consumer ' + req.params.consumerId);

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'WITH',
        '"user" AS',
          '(INSERT INTO users ({uidField}, {upassField}) SELECT $uid, $upass',
            'WHERE NOT EXISTS (SELECT 1 FROM users WHERE {uidField} = $uid)',
            'RETURNING *),',
        '"userGroup" AS',
          '(INSERT INTO "usersGroups" ("userId", "groupId")',
            'SELECT "user".id, groups.id FROM groups, "user" WHERE groups.name = \'consumer\' RETURNING id),',
        '"consumer" AS',
          '(INSERT INTO "consumers" ("userId", "firstName", "lastName", "cardId", "screenName")',
            'SELECT "user".id, $firstName, $lastName, $cardId, $screenName FROM "user" RETURNING id)',
      'SELECT "user".id as "userId", "consumer".id as "consumerId" FROM "user", "consumer"'
    ]);
    if (req.body.email) {
      query.uidField = 'email';
      query.upassField = 'password';
      query.$('uid', req.body.email);
      query.$('upass', utils.encryptPassword(req.body.password));
    } else {
      query.uidField = '"singlyId"';
      query.upassField = '"singlyAccessToken"';
      query.$('uid', req.body.singlyId);
      query.$('upass', req.body.singlyAccessToken);
    }
    query.$('firstName', req.body.firstName);
    query.$('lastName', req.body.lastName);
    query.$('cardId', req.body.cardId || '');
    query.$('screenName', req.body.screenName);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      // did the insert occur?
      if (result.rowCount === 0) {
        // email must have already existed
        if (req.body.email) return res.error(errors.registration.EMAIL_REGISTERED);

        // Access token already existed - for now, send back generic error
        // Because they should have used POST /oauth to create/auth
        return res.error(errors.internal.DB_FAILURE);
      }

      req.body.consumerId = result.rows[0].consumerId;
      req.body.userId = result.rows[0].userId;

      if (req.body.email) {
        var emailHtml = templates.email.complete_registration({
          url:'http://loljk.com',
        });
        utils.sendMail(req.body.email, config.emailFromAddress, 'Welcome to Goodybag!', emailHtml/*, function(err, result) {
          console.log('email cb', err, result);
        }*/);
      }

      // Log the user in
      req.session.user = {
        id: req.body.userId
      , email: req.body.email
      , singlyAccessToken: req.body.singlyAccessToken
      , singlyId: req.body.singlyId
      , groups: ['consumers']
      };

      res.json({ error: null, data: result.rows[0] });

      magic.emit('consumers.registered', req.body);
    });
  });
};

/**
 * Delete consumer
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-consumer', req.uuid];
  logger.routes.debug(TAGS, 'deleting consumer ' + req.params.consumerId);

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'DELETE FROM users USING consumers',
        'WHERE users.id = consumers."userId"',
        'AND consumers.id = $id'
    ]);
    query.$('id', +req.params.consumerId || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) return res.status(404).end();

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
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

  var getConsumerRecord = function(callback){
    if (!req.session || !req.session.user)
      return res.error(errors.auth.NOT_AUTHENTICATED), logger.routes.error(TAGS, errors.auth.NOT_AUTHENTICATED);

    var query = {};

    // Either way, we'll need to get the userId or consumerId
    // Depending on how they're requesting this
    if (req.param('consumerId') && req.param('consumerId') != 'session')
      query.id = req.param('consumerId');
    else
      query.userId = req.session.user.id;

    db.api.consumers.findOne(query, { fields: ['id', '"userId"'] }, function(error, consumer){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (!consumer || !consumer.id)
        return res.error(errors.input.NOT_FOUND), logger.routes.error(TAGS, errors.input.NOT_FOUND);

      return callback(consumer);
    });
  };

  getConsumerRecord(function(consumer){
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

          var query = sql.query('UPDATE consumers SET {updates} WHERE id=$id');
          query.updates = sql.fields().addUpdateMap(data, query);
          query.$('id', consumer.id);

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

          var encryptPassword = function(cb){
            if (!req.body.password) return cb();

            utils.encryptPassword(req.body.password, function(error, encrypted){
              data.password = encrypted;
              cb();
            });
          };

          encryptPassword(function(){
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

              return callback();;
            });
          });
        };

        utils.parallel({
          consumer: updateConsumerRecord
        , user:     updateUserRecord
        }, function(error, results){
          if (error){
            tx.abort();
            if (error.name === "DB_FAILURE"){
              res.error(errors.internal.DB_FAILURE, error)
            } else {
              res.error(error);
            }

            return logger.routes.error(TAGS, error);
          }

          tx.commit(function(error){
            if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

            res.json({ error: null, data: null });
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
  logger.routes.debug(TAGS, 'fetching consumer ' + req.params.consumerId + ' collections');

  var consumerId = req.param('consumerId');

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = sql.query([
      'SELECT {fields} FROM collections',
        'LEFT JOIN "productsCollections" ON "productsCollections"."collectionId" = collections.id',
        'LEFT JOIN products ON products.id = "productsCollections"."productId" AND "photoUrl" IS NOT NULL',
        'WHERE "consumerId" = $consumerId',
        'GROUP BY collections.id {limit}'
    ]);
    query.fields = sql.fields()
      .add("collections.*")
      .add('COUNT("productsCollections".id) as "numProducts"')
      .add('MIN(products."photoUrl") as "photoUrl"');
    query.where  = sql.where();
    query.limit  = sql.limit(req.query.limit, req.query.offset);
    query.$('consumerId', consumerId);

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
 * Create consumer collection
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.createCollection = function(req, res){
  var TAGS = ['create-consumers-collection', req.uuid];
  logger.routes.debug(TAGS, 'creating consumer ' + req.params.consumerId + ' collection');

  var consumerId = req.param('consumerId');
  var name = req.body.name;
  if (!name)
    return res.error(errors.input.VALIDATION_FAILED, '`name` is required');

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('INSERT INTO collections ("consumerId", name) VALUES ($consumerId, $name) RETURNING id');
    query.$('consumerId', consumerId);
    query.$('name', name);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      res.json({ error: null, data: { id:result.rows[0].id }});
    });
  });
};

/**
 * Add product to consumer collection
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.addCollectionProduct = function(req, res){
  var TAGS = ['create-consumers-collection', req.uuid];
  logger.routes.debug(TAGS, 'creating consumer ' + req.params.consumerId + ' collection');

  var consumerId = req.param('consumerId');
  var collectionId = req.param('collectionId');
  var productId = req.body.productId;
  if (!productId)
    return res.error(errors.input.VALIDATION_FAILED, '`productId` is required');

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('INSERT INTO "productsCollections" ("collectionId", "productId", "createdAt") VALUES ($consumerId, $productId, now()) RETURNING id');
    query.$('consumerId', consumerId);
    query.$('productId', productId);

    client.query(query.toString(), query.$values, function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      res.json({ error: null, data: { id:result.rows[0].id }});
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
  if (!email) {
    return res.error(errors.input.VALIDATION_FAILED, '`email` is required.')
  }
  if (!newCardId) {
    return res.error(errors.input.VALIDATION_FAILED, '`cardId` is required.')
  }

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = 'SELECT consumers.id as "consumerId", consumers."cardId" FROM users INNER JOIN consumers ON consumers."userId" = users.id AND users.email = $1';
    client.query(query, [email], function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) return res.error(errors.input.NOT_FOUND);
      var consumerId = result.rows[0].consumerId;
      var oldCardId  = result.rows[0].cardId;

      var token = require("randomstring").generate();
      var query = sql.query([
        'INSERT INTO "consumerCardUpdates" ("consumerId", "newCardId", "oldCardId", token, expires, "createdAt")',
          'VALUES ($consumerId, $newCardId, $oldCardId, $token, now() + \'2 weeks\'::interval, now())'
      ]);
      query.$('consumerId', consumerId);
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
          res.json({ err:null, data:null });
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
    client.query('SELECT "consumerId", "newCardId" FROM "consumerCardUpdates" WHERE token=$1 AND expires > now()', [req.params.token], function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) {
        return res.error(errors.input.VALIDATION_FAILED, 'Your card-update token was not found or has expired. Please request a new one.')
      }
      var targetConsumerId = result.rows[0].consumerId;
      var newCardId = result.rows[0].newCardId;

      client.query('UPDATE consumers SET "cardId"=$1 WHERE id=$2', [newCardId, targetConsumerId], function(error, result) {
        if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        res.json({ err:null, data:null });
      });
    });
  });
};