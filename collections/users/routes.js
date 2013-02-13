/**
 * Users
 */

var
  db      = require('../../db')
, sql     = require('../../lib/sql')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config  = require('../../config')

, logger  = {}
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

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query([
      'SELECT users.*, array_agg("usersGroups"."groupId") AS groups',
        'FROM users LEFT JOIN "usersGroups" ON "usersGroups"."userId" = users.id',
        'WHERE users.id = $id',
        'GROUP BY users.id'
    ]);
    //query.fields = sql.fields().addSelectMap(req.fields);
    query.$('id', +req.param('id') || 0);

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
 * List users
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-users', req.uuid];
  logger.routes.debug(TAGS, 'fetching users ' + req.params.id);

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('SELECT *, COUNT(id) OVER() as "metaTotal" FROM users {where} {limit}');
    query.where = sql.where();
    query.limit = sql.limit(req.query.limit, req.query.offset);

    if (req.param('filter')) {
      query.where.and('users.email ILIKE $emailFilter');
      query.$('emailFilter', '%'+req.param('filter')+'%');
    }

    client.query(query.toString(), query.$values, function(error, dataResult){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      logger.db.debug(TAGS, dataResult);

      var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
      return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
    });
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

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var tx = new Transaction(client);
    tx.begin(function() {

      var query = sql.query([
        'INSERT INTO users (email, password)',
          'SELECT $email, $password WHERE NOT EXISTS (SELECT 1 FROM users WHERE email=$email)',
          'RETURNING id'
      ]);
      query.$('email', req.body.email);
      query.$('password', utils.encryptPassword(req.body.password));
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
            client.query(query, [newUser.id, groupId], done);
          }
        }), function(err, results) {
          // did any insert fail?
          if (err || results.filter(function(r) { return r.rowCount === 0; }).length !== 0) {
            // the target group must not have existed
            tx.abort();
            return res.error(errors.input.INVALID_GROUPS);
          }

          tx.commit();
          return res.json({ error: null, data: newUser });
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

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = sql.query('DELETE FROM users WHERE id=$id');
    query.$('id', +req.params.id || 0);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
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
  var groups = req.body.groups;

  db.getClient(TAGS[0], function(error, client){
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
            client.query(query, [req.param('id'), groupId], done);
          }
        }), function(err, results) {
          // did any insert fail?
          if (err || results.filter(function(r) { return r.rowCount === 0; }).length !== 0) {
            // the target group must not have existed
            tx.abort();
            return res.error(errors.input.INVALID_GROUPS);
          }

          // done
          tx.commit();
          return res.json({ error: null, data: null });
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
      query.$('id', req.params.id)
      if (email) {
        query.updates.add('email = $email');
        query.emailClause = 'AND $email NOT IN (SELECT email FROM users WHERE id != $id AND email IS NOT NULL)'; // this makes sure the user doesn't take an email in use
        query.$('email', email);
      }
      if (password) {
        query.updates.add('password = $password');
        query.$('password', utils.encryptPassword(password));
      }

      logger.db.debug(TAGS, query.toString());

      if (query.updates.fields.length === 0) return applyGroupRelations();

      // run update query
      client.query(query.toString(), query.$values, function(error, result){
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
            } else {
              // email must have already existed
              return res.error(errors.registration.EMAIL_REGISTERED);
            }
          });
          return;
        }

        // are we done?
        if (typeof req.body.groups == 'undefined') {
          tx.commit();
          return res.json({ error: null, data: null });
        }

        applyGroupRelations();
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
  if (!email) {
    return res.error(errors.input.VALIDATION_FAILED, '`email` is required.')
  }

  db.getClient(TAGS[0], function(error, client){
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
          res.json({ err:null, data:null });
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

  var newPassword = req.body.password;
  if (!newPassword) {
    return res.error(errors.input.VALIDATION_FAILED, '`password` is required.')
  }

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    client.query('SELECT id, "userId" FROM "userPasswordResets" WHERE token=$1 AND expires > now()', [req.params.token], function(error, result) {
      if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0) {
        return res.error(errors.input.VALIDATION_FAILED, 'Your reset token was not found or has expired. Please request a new one.')
      }
      var userId = result.rows[0].userId;

      client.query('UPDATE users SET password=$1 WHERE id=$2', [utils.encryptPassword(newPassword), userId], function(error, result) {
        if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        res.json({ err:null, data:null });
      });
    });
  });
};