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
  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // start transaction
    var tx = new Transaction(client);
    tx.begin(function() {

      var user = {
        email    : req.body.email,
        password : (req.body.password) ? utils.encryptPassword(req.body.password) : undefined,
        groups   : req.body.groups
      };

      // build update query
      var query = [
        'UPDATE users SET',
        '  email    =', (user.email)    ? '$2' : 'email',
        ', password =', (user.password) ? '$3' : 'password',
        'WHERE users.id = $1 AND $2 NOT IN (SELECT email FROM users WHERE id != $1)' // this makes sure the user doesn't take an email in use
      ].join(' ');
      logger.db.debug(TAGS, query);

      // run update query
      client.query(query, [+req.param('id') || 0].concat(user.email || []).concat(user.password || []), function(error, result){
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

        // delete all group relations
        var query = usersGroups.delete()
          .where(usersGroups.userId.equals(req.param('id')));
        client.query(query.toQuery(), function(error, result) {
          if (error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

          // add new group relations
          async.series((user.groups || []).map(function(groupId) {
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

  db.getClient(TAGS[0], function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    client.query('SELECT email FROM users WHERE id=$1', [req.params.id], function(error, result) {
      if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var email = result.rows[0].email;
      if (!email) {
        return res.error(errors.registration.EMAIL_NEEDED), logger.routes.error(TAGS, 'User has no email assigned');
      }

      var token = require("randomstring").generate();
      var query = sql.query([
        'INSERT INTO "userPasswordResets" ("userId", token, expires, "createdAt")',
          'VALUES ($userId, $token, now() + \'1 day\'::interval, now())'
      ]);
      query.$('userId', req.params.id);
      query.$('token', token);
      console.log(query.toString())
      client.query(query.toString(), query.$values, function(error, result) {
        console.log(error)
        if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        var emailHtml = templates.email.reset_password({
          url : config.baseUrl + '/v1/users/password-reset/' + token
        });
        utils.sendMail(email, config.emailFromAddress, 'Goodybag Password Reset Link', emailHtml);

        res.json({ err:null, data:{ token:token }});
      });
    });
  });
};
