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
        utils.sendMail(req.body.email, config.emailFromAddress, 'Welcome to Goodybag!', 'body todo'/*, function(err, result) {
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
  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('UPDATE consumers SET {updates} WHERE id=$id');
    query.updates = sql.fields().addUpdateMap(req.body, query);
    query.$('id', req.params.consumerId);

    logger.db.debug(TAGS, query.toString());

    // run update query
    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, result);

      // did the update occur?
      if (result.rowCount === 0) {
        return res.status(404).end();
      }

      // done
      return res.json({ error: null, data: null });
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
