/**
 * Users
 */

var
  db      = require('../../db')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')

, logger  = {}

  // Tables
, users       = db.tables.users
, groups      = db.tables.groups
, usersGroups = db.tables.usersGroups
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
  logger.routes.debug(TAGS, 'fetching user ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build query
    // :TODO: nuke this fields kludge
    var fields = [];
    for (var field in req.fields) {
      if (field === 'groups') {
        fields.push('array_agg("usersGroups"."groupId") as groups');
      } else {
        fields.push('users.' + field + ' AS ' + field);
      }
    }
    var query = [
      'SELECT', fields.join(', '), 'FROM users',
      'LEFT JOIN "usersGroups" ON "usersGroups"."userId" = users.id',
      'WHERE users.id = $1',
      'GROUP BY users.id'
    ].join(' ');
    /*utils.selectAsMap(users, req.fields)
      .from(users
        .join(usersGroups)
          .on(usersGroups.userId.equals(users.id)))
      .where(users.id.equals(req.params.id));*/

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
 * List users
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-users', req.uuid];
  logger.routes.debug(TAGS, 'fetching users ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // build data query
    var query = utils.selectAsMap(users, req.fields)
      .from(users);

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
      client.query('SELECT COUNT(*) as count FROM users', function(error, countResult) {
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.json({ error: null, data: dataResult.rows, meta: { total:countResult.rows[0].count } });
      });
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
  logger.routes.debug(TAGS, 'creating user ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    // start transaction
    var tx = new Transaction(client);
    tx.begin(function() {

      // build query
      var user = {
        email:    req.body.email
      , password: utils.encryptPassword(req.body.password)
      , groups:   req.body.groups
      };
      var query = 'INSERT INTO users (email, password) SELECT $1, $2 WHERE $1 NOT IN (SELECT email FROM users) RETURNING id';
      client.query(query, [user.email, user.password], function(error, result) {
        if(error) return res.error(errors.internal.DB_FAILURE, error), tx.abort(), logger.routes.error(TAGS, error);

        // did the insert occur?
        if (result.rowCount === 0) {
          // email must have already existed
          tx.abort();
          return res.error(errors.registration.EMAIL_REGISTERED);
        }
        var newUser = result.rows[0];

        // add groups
        async.series((user.groups || []).map(function(groupId) {
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
  logger.routes.debug(TAGS, 'deleting user ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var query = users.delete().where(
      users.id.equals(req.params.id)
    ).toQuery();

    client.query(query.text, query.values, function(error, result){
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
  db.getClient(function(error, client){
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
