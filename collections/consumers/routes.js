/**
 * Users
 */

var
  singly  = require('singly')

  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config  = require('../../config')

, logger  = {}

  // Tables
, users       = db.tables.users
, consumers   = db.tables.consumers
, groups      = db.tables.groups
, usersGroups = db.tables.usersGroups
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
  logger.routes.debug(TAGS, 'fetching consumer ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var fields = [];
    for (var field in req.fields){
      fields.push(
        (("id,email,password".indexOf(field) > -1) ? '"users"' : '"consumers"')
      + '."'
      + field + '" AS "'
      + field + '"'
      );
    }
    var query = [
      'SELECT', fields.join(', '), 'FROM users',
      'LEFT JOIN "consumers" ON "consumers"."userId" = users.id',
      'WHERE users.id = $1'
    ].join(' ');

    client.query(query, [(+req.param('id')) || 0], function(error, result){
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
  var TAGS = ['list-users', req.uuid];
  logger.routes.debug(TAGS, 'fetching users ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = utils.selectAsMap(users, req.fields).from(
      users.join(consumers).on(
        users.id.equals(consumers.userId)
      )
    );

    // add query filters
    if (req.param('filter')) {
      query.where(users.email.like('%'+req.param('filter')+'%'))
    }
    utils.paginateQuery(req, query);

    // run data query
    client.query(query.toQuery(), function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, dataResult);

      // run count query
      client.query('SELECT COUNT(*) as count FROM users, consumers where users.id = consumers."userId"', function(error, countResult) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: dataResult.rows, meta: { total:countResult.rows[0].count } });
      });
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
  logger.routes.debug(TAGS, 'creating consumer ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // start transaction
    var tx = new Transaction(client);
    tx.begin(function() {

      // build user query
      var user = {}, fields;
      if (req.body.email){
        fields = ['email', 'password'];
        user.email = req.body.email;
        user.password = utils.encryptPassword(req.body.password);
      }else{
        fields = ['"singlyId"', '"singlyAccessToken"'];
        user.singlyId = req.body.singlyId;
        user.singlyAccessToken = req.body.singlyAccessToken;
      }

      var query = 'INSERT INTO users (' + fields.join(', ') + ') SELECT $1, $2 WHERE $1 NOT IN (SELECT email FROM users) RETURNING id';

      client.query(query, [user.email, user.password], function(error, result) {
        if(error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

        // did the insert occur?
        if (result.rowCount === 0) {
          // email must have already existed
          tx.abort();
          return res.error(errors.registration.EMAIL_REGISTERED);
        }

        var newUser = result.rows[0];

        // add group
        var query = 'INSERT INTO "usersGroups" ("userId", "groupId") SELECT $1, id FROM groups WHERE groups.name = $2';

        client.query(query, [newUser.id, 'consumer'], function(err, results){
          if (err) return tx.abort(), res.error(errors.input.INVALID_GROUPS);
          if (results.rowCount === 0) return tx.abort(), res.error(errors.input.INVALID_GROUPS);

          // Add consumer information
          query = consumers.insert({
            userId:     newUser.id
          , firstName:  req.body.firstName
          , lastName:   req.body.lastName
          , tapinId:    req.body.tapinId
          , screenName: req.body.screenName
          }).toQuery();

          client.query(query, function(error, result){
            if (error){
              tx.abort();
              res.error(errors.internal.DB_FAILURE, error);
              return logger.routes.error(TAGS, error);
            }

            tx.commit();
            return res.json({ error: null, data: newUser });
          });
        });
      });
    });
  });
};

/**
 * Delete user
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-user', req.uuid];
  logger.routes.debug(TAGS, 'deleting user ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var tx = new Transaction(client);

    tx.begin(function(){
      var query = consumers.delete().where(
        consumers.userId.equals(req.params.id)
      ).toQuery();

      client.query(query.text, query.values, function(error, result){
        if (error) return tx.abort(), res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
        if (result.rowCount === 0) return tx.abort(), res.status(404).end();

        logger.db.debug(TAGS, result);

        query = users.delete().where(
          users.id.equals(req.params.id)
        ).toQuery();

        client.query(query.text, query.values, function(error, result){
          if (error) return tx.abort(), res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

          tx.commit();

          return res.json({ error: null, data: null });
        });
      });
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
  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // start transaction
    var tx = new Transaction(client);
    tx.begin(function() {

      var
        query = "update consumers set"
      , values = []
      ;

      // Include only allowed fields in update
      for (var key in req.body){
        if (!(key in req.fields)) continue;
        query += ' "' + key + '" = $' + values.push(req.body[key]) + ', '
      }

      // Clean up last comma
      query = query.substring(0, query.length - 2);

      query += ' where consumers."userId" = $' + values.push(req.params.id);

      logger.db.debug(TAGS, query);

      // run update query
      client.query(query, values, function(error, result){
        if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);
        logger.db.debug(TAGS, result);

        // did the update occur?
        if (result.rowCount === 0) {
          tx.abort();
          // figure out what the problem was
          client.query('SELECT id FROM users WHERE id=$1', [+req.param('id') || 0], function(error, results) {
            if (results.rowCount == 0) {
              // id didnt exist
              return res.status(404).end();
            }
          });
          return;
        }

        // done
        tx.commit();
        return res.json({ error: null, data: null });
      });
    });
  });
};
