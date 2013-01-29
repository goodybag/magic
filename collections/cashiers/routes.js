/**
 * cashiers
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
, cashiers    = db.tables.cashiers
, groups      = db.tables.groups
, usersGroups = db.tables.usersGroups
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

/**
 * Get cashier
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-cashiers', req.uuid];
  logger.routes.debug(TAGS, 'fetching cashier ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = [
      'SELECT users.*, cashiers.* FROM users',
      'LEFT JOIN "cashiers" ON "cashiers"."userId" = users.id',
      'WHERE cashiers.id = $1'
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
 * List cashiers
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
      users.join(cashiers).on(
        users.id.equals(cashiers.userId)
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
      client.query('SELECT COUNT(*) as count FROM users, cashiers where users.id = cashiers."userId"', function(error, countResult) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: dataResult.rows, meta: { total:countResult.rows[0].count } });
      });
    });
  });
};

/**
 * Create cashiers
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-cashiers', req.uuid];
  logger.routes.debug(TAGS, 'creating cashier ' + req.params.id);

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // start transaction
    var tx = new Transaction(client);
    tx.begin(function() {

      // build user query
      var user = {}, fields, query;
      if (req.body.email){
        fields = ['email', 'password'];
        user.email = req.body.email;
        user.password = utils.encryptPassword(req.body.password);
      }else{
        fields = ['singlyId', 'singlyAccessToken'];
        user.singlyId = req.body.singlyId;
        user.singlyAccessToken = req.body.singlyAccessToken;
      }

      var query = 'INSERT INTO users ("'
                + fields.join('", "')
                + '") SELECT $1, $2 '
                + 'WHERE $1 NOT IN '
                + '(SELECT "' + fields[0] + '" FROM users '
                  + 'WHERE "' + fields[0] + '" != \'\') '
                + 'RETURNING id';

      // Extract the relevant values
      fields = fields.map(function(f){ return user[f]; });

      client.query(query, fields, function(error, result) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

        // did the insert occur?
        if (result.rowCount === 0) {
          // email must have already existed
          tx.abort();
          if (req.body.email) return res.error(errors.registration.EMAIL_REGISTERED);

          // Access token already existed - for now, send back generic error
          // Because they should have used POST /oauth to create/auth
          return res.error(errors.internal.DB_FAILURE);
        }

        var newUser = result.rows[0];

        // add group
        var query = 'INSERT INTO "usersGroups" ("userId", "groupId") SELECT $1, id FROM groups WHERE groups.name = $2';
        client.query(query, [newUser.id, 'cashier'], function(err, results){
          if (err) return tx.abort(), res.error(errors.input.INVALID_GROUPS);
          if (results.rowCount === 0) return tx.abort(), res.error(errors.input.INVALID_GROUPS);

          // Add cashier information
          query = cashiers.insert({
            userId:     newUser.id
          , cardId:     req.body.cardId
          , businessId: req.body.businessId
          , locationId: req.body.locationId
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

    var query = cashiers.delete().where(
      cashiers.id.equals(req.params.id)
    ).toQuery();

    client.query(query.text, query.values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) return res.status(404).end();

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};

/**
 * Update cashier
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-cashier', req.uuid];
  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // start transaction
    var tx = new Transaction(client);
    tx.begin(function() {

      var
        query = "update cashiers set"
      , values = []
      ;

      // Include only allowed fields in update
      for (var key in req.body){
        if (!(key in req.fields)) continue;
        query += ' "' + key + '" = $' + values.push(req.body[key]) + ', '
      }

      // Clean up last comma
      query = query.substring(0, query.length - 2);

      query += ' where cashiers.id = $' + values.push(req.params.id);

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
