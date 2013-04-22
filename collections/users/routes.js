/**
 * Users
 */

var
  db          = require('../../db')
, sql         = require('../../lib/sql')
, utils       = require('../../lib/utils')
, errors      = require('../../lib/errors')
, config      = require('../../config')
, templates   = require('../../templates')
, Transaction = require('pg-transaction')
, async       = require('async')

, logger    = {}
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});


/**
 * Get user
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-users', req.uuid];
  logger.routes.debug(TAGS, 'fetching user ' + req.params.id);

  var query = sql.query([
    'SELECT users.*',
      ', array_agg(groups.id)   AS "groupIds"',
      ', array_agg(groups.name) AS "groupNames"',
    'FROM users',
    'LEFT JOIN "usersGroups"  ON "usersGroups"."userId" = users.id',
    'LEFT JOIN groups         ON groups.id = "usersGroups"."groupId"',
    'WHERE users.id = $id',
    'GROUP BY users.id'
  ]);

  //query.fields = sql.fields().addSelectMap(req.fields);
  query.$('id', +req.param('id') || 0);

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    if (result.rowCount == 1) {
      var row = result.rows[0];
      row.groups = [];

      if (row.groupIds && row.groupIds[0] != null){
        for (var i = 0; i < row.groupIds.length; i++){
          row.groups.push({ id: row.groupIds[i], name: row.groupNames[i] });
        }
      }

      delete row.groupIds;
      delete row.groupNames;

      return res.json({ error: null, data: row });
    } else {
      return res.status(404).end();
    }
  });
};

/**
 * List users
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-users', req.uuid];
  logger.routes.debug(TAGS, 'fetching users ' + req.params.id);

  var query = sql.query([
    'SELECT users.*',
      ', COUNT(users.id) OVER() AS "metaTotal"',
      ', array_agg(groups.id)   AS "groupIds"',
      ', array_agg(groups.name) AS "groupNames"',
    'FROM users',
    'LEFT JOIN "usersGroups"  ON "usersGroups"."userId" = users.id',
    'LEFT JOIN groups         ON groups.id = "usersGroups"."groupId"',
    '{where}',
    'GROUP BY users.id {limit}'
  ]);

  query.where = sql.where();
  query.limit = sql.limit(req.query.limit, req.query.offset);

  if (req.param('filter')) {
    query.where.and('users.email ILIKE $emailFilter');
    query.$('emailFilter', '%'+req.param('filter')+'%');
  }

  db.query(query, function(error, rows, dataResult){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var rows = dataResult.rows;

    rows = rows.map(function(r){
      r.groups = [];

      if (r.groupIds && r.groupIds[0] != null){
        for (var i = 0; i < r.groupIds.length; i++){
          r.groups.push({ id: r.groupIds[i], name: r.groupNames[i] });
        }
      }

      delete r.groupIds;
      delete r.groupNames;

      return r;
    });

    var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;

    return res.json({ error: null, data: rows, meta: { total:total } });
  });
};

/**
 * Create users
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-users', req.uuid];
  logger.routes.debug(TAGS, 'creating user ' + req.params.id);

  utils.encryptPassword(req.body.password, function(err, encryptedPassword, passwordSalt) {

    db.getClient(TAGS, function(error, client){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var tx = new Transaction(client);
      tx.begin(function() {

        var query = sql.query([
          'INSERT INTO users (email, password, "passwordSalt", "cardId", "createdAt")',
            'SELECT $email, $password, $salt, $cardId, $createdAt WHERE NOT EXISTS (SELECT 1 FROM users WHERE email=$email)',
            'RETURNING id'
        ]);
        query.$('email', req.body.email);
        query.$('password', encryptedPassword);
        query.$('salt', passwordSalt);
        query.$('cardId', req.body.cardId ? req.body.cardId.toUpperCase() : null);
        query.$('createdAt', 'now()');
        client.query(query.toString(), query.$values, function(error, result) {
          if(error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

          // did the insert occur?
          if (result.rowCount === 0) {
            // email must have already existed
            tx.abort();
            return res.error(errors.registration.EMAIL_REGISTERED);
          }
          var newUser = result.rows[0];

          // add groups
          async.series((req.body.groups || []).map(function(groupId) {
            return function(done) {
              var query = 'INSERT INTO "usersGroups" ("userId", "groupId") SELECT $1, $2 FROM groups WHERE groups.id = $2';
              client.query(query, [newUser.id, typeof groupId === "object" ? groupId.id : groupId], done);
            };
          }), function(err, results) {
            // did any insert fail?
            if (err || results.filter(function(r) { return r.rowCount === 0; }).length !== 0) {
              // the target group must not have existed
              tx.abort();
              return res.error(errors.input.INVALID_GROUPS);
            }

            tx.commit(function() { res.json({ error: null, data: newUser }); });
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

  var query = sql.query('DELETE FROM users WHERE id=$id');
  query.$('id', +req.params.id || 0);

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    res.noContent();
  });
};

/**
 * Update user
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-user', req.uuid];

  var email = req.body.email;
  var password = req.body.password;
  var cardId = req.body.cardId;
  var groups = req.body.groups;

  utils.encryptPassword(password, function(err, encryptedPassword, passwordSalt) {

    db.getClient(TAGS, function(error, client){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var tx = new Transaction(client);

      var applyGroupRelations = function(){
        // delete all group relations
        var query = usersGroups.delete()
          .where(usersGroups.userId.equals(req.param('id')));
        client.query(query.toQuery(), function(error, result) {
          if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

          // add new group relations
          async.series((groups || []).map(function(groupId) {
            return function(done) {
              var query = 'INSERT INTO "usersGroups" ("userId", "groupId") SELECT $1, $2 FROM groups WHERE groups.id = $2';
              client.query(query, [req.param('id'), typeof groupId === "object" ? groupId.id : groupId], done);
            };
          }), function(err, results) {
            // did any insert fail?
            if (err || results.filter(function(r) { return r.rowCount === 0; }).length !== 0) {
              // the target group must not have existed
              tx.abort();
              return res.error(errors.input.INVALID_GROUPS);
            }

            // done
            tx.commit(function() { res.noContent(); });
          });
        });
      };

      // start transaction
      tx.begin(function() {

        // build update query
        var query = sql.query([
          'UPDATE users SET {updates}',
            'WHERE users.id = $id {emailClause}'
        ]);
        query.updates = sql.fields();
        query.$('id', req.params.id);
        if (email) {
          query.updates.add('email = $email');
          query.emailClause = 'AND $email NOT IN (SELECT email FROM users WHERE id != $id AND email IS NOT NULL)'; // this makes sure the user doesn't take an email in use
          query.$('email', email);
        }
        if (password) {
          query.updates.add('password = $password');
          query.$('password', encryptedPassword);
          query.updates.add('"passwordSalt" = $salt');
          query.$('salt', passwordSalt);
        }
        if (cardId) {
          query.updates.add('"cardId" = $cardId');
          query.$('cardId', cardId.toUpperCase());
        }

        if (query.updates.fields.length === 0) return applyGroupRelations();

        // run update query
        client.query(query.toString(), query.$values, function(error, result){
          if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

          // did the update occur?
          if (result.rowCount === 0) {
            tx.abort();
            // figure out what the problem was
            client.query('SELECT id FROM users WHERE id=$1', [+req.param('id') || 0], function(error, results) {
              if (results.rowCount === 0) {
                // id didnt exist
                return res.status(404).end();
              } else {
                // email must have already existed
                return res.error(errors.registration.EMAIL_REGISTERED);
              }
            });
            return;
          }

          // are we done?
          if (typeof req.body.groups == 'undefined') {
            tx.commit(function(){ res.noContent(); });
            return;
          }

          applyGroupRelations();
        });
      });
    });
  });
};

/**
 * Create user password reset record
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.createPasswordReset = function(req, res){
  var TAGS = ['create-user-password-reset', req.uuid];
  logger.routes.debug(TAGS, 'creating user ' + req.params.id + ' password reset');

  var email = req.body.email;
  if (!email)
    return res.error(errors.input.VALIDATION_FAILED, '`email` is required.');

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    client.query('SELECT id FROM users WHERE email=$1', [email], function(error, result) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) return res.error(errors.input.NOT_FOUND);
      var userId = result.rows[0].id;

      var token = require("randomstring").generate();
      var query = sql.query([
        'INSERT INTO "userPasswordResets" ("userId", token, expires, "createdAt")',
          'VALUES ($userId, $token, now() + \'1 day\'::interval, now())'
      ]);
      query.$('userId', userId);
      query.$('token', token);
      client.query(query.toString(), query.$values, function(error, result) {
        if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        var emailHtml = templates.email.reset_password({
          url : config.baseUrl + '/v1/users/password-reset/' + token
        });
        utils.sendMail(email, config.emailFromAddress, 'Goodybag Password Reset Link', emailHtml);

        if (req.session.user && req.session.user.groups.indexOf('admin') !== -1)
          res.json({ err:null, data:{ token:token }});
        else
          res.noContent();
      });
    });
  });
};

/**
 * Reset user password
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.resetPassword = function(req, res){
  var TAGS = ['reset-user-password', req.uuid];
  logger.routes.debug(TAGS, 'resetting user ' + req.params.id + ' password');

  utils.encryptPassword(req.body.password, function(err, encryptedPassword, passwordSalt) {

    db.getClient(TAGS, function(error, client){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      client.query('SELECT id, "userId" FROM "userPasswordResets" WHERE token=$1 AND expires > now()', [req.params.token], function(error, result) {
        if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
        if (result.rowCount === 0)
          return res.error(errors.input.VALIDATION_FAILED, 'Your reset token was not found or has expired. Please request a new one.');
        var userId = result.rows[0].userId;

        client.query('UPDATE users SET password=$1, "passwordSalt"=$2 WHERE id=$3', [encryptedPassword, passwordSalt, userId], function(error, result) {
          if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

          res.noContent();
        });
      });
    });
  });
};
