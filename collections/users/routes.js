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
, magic       = require('../../lib/magic')
, oauth       = require('../../lib/oauth')

, logger    = {}
;

var usersGroups = db.tables.usersGroups;

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
 * Search users
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.search = function(req, res) {
  var TAGS = ['search-users', req.uuid];
  logger.routes.debug(TAGS, 'searching user');

  var lastName  = req.param('lastName')
    , firstName = req.param('firstName');

  var query = sql.query([
    'SELECT users.*, consumers."firstName", consumers."lastName"',
      ', COUNT(users.id) OVER() AS "metaTotal"',
      ', array_agg(groups.id)   AS "groupIds"',
      ', array_agg(groups.name) AS "groupNames"',
    'FROM users',
    'LEFT JOIN "usersGroups"  ON "usersGroups"."userId" = users.id',
    'LEFT JOIN groups         ON groups.id = "usersGroups"."groupId"',
    'LEFT JOIN consumers      ON consumers.id = users.id',
    '{where}',
    'GROUP BY users.id, consumers."lastName", consumers."firstName"',
    '{limit}'
  ]);

  query.where = sql.where();
  query.limit = sql.limit(req.query.limit, req.query.offset);
  
  if (lastName) {
    query.where.and('consumers."lastName" ILIKE $lastName');
    query.$('lastName', lastName);
  }

  if (firstName) {
    query.where.and('consumers."firstName" ILIKE $firstName');
    query.$('firstName', firstName);
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
}

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

    db.getClient(TAGS, function(error, client, done){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var tx = new Transaction(client);
      tx.begin(function(error) {
        if(error) {
          //destroy client on error
          done(error);
          return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
        }
        var query = sql.query([
          'INSERT INTO users (email, password, "passwordSalt", "cardId", "createdAt")',
            'VALUES ($email, $password, $salt, $cardId, $createdAt)',
            'RETURNING *'
        ]);
        query.$('email', req.body.email);
        query.$('password', encryptedPassword);
        query.$('salt', passwordSalt);
        query.$('cardId', req.body.cardId ? req.body.cardId.toUpperCase() : null);
        query.$('createdAt', 'now()');
        client.query(query.toString(), query.$values, function(error, result) {
          if (error) {
            // postgres error code 23505 is violation of uniqueness constraint
            res.error(parseInt(error.code) === 23505 ? errors.registration.EMAIL_REGISTERED : errors.internal.DB_FAILURE, error);
            tx.abort(done);
            logger.routes.error(TAGS, error);
            return;
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
              tx.abort(done);
              return res.error(errors.input.INVALID_GROUPS);
            }

            tx.commit(function(error) {
              done(error);
              res.json({ error: null, data: newUser });
            });
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

    db.getClient(TAGS, function(error, client, done){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var tx = new Transaction(client);

      var applyGroupRelations = function(){
        // delete all group relations
        var query = usersGroups.delete()
          .where(usersGroups.userId.equals(req.param('id')));
        client.query(query.toQuery(), function(error, result) {
          if (error) {
            return res.error(errors.internal.DB_FAILURE, error), tx.abort(done), logger.routes.error(TAGS, error);
          }

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
              tx.abort(done);
              return res.error(errors.input.INVALID_GROUPS);
            }

            // done
            tx.commit(function(err) {
              done(err);
              res.noContent();
            });
          });
        });
      };

      // start transaction
      tx.begin(function() {

        // build update query
        var query = sql.query([
          'UPDATE users SET {updates}',
            'WHERE users.id = $id {emailClause} RETURNING email, password, "singlyId"'
        ]);
        query.updates = sql.fields();
        query.$('id', req.params.id);
        if (email) {
          query.updates.add('email = $email');
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
          if (error) {
            // postgres error code 23505 is violation of uniqueness constraint
            res.error(parseInt(error.code) === 23505 ? errors.registration.EMAIL_REGISTERED : errors.internal.DB_FAILURE, error);
            tx.abort(done);
            logger.routes.error(TAGS, error);
            return;
          }

          // did the update occur?
          if (result.rowCount === 0) {
            // figure out what the problem was
            client.query('SELECT id FROM users WHERE id=$1', [+req.param('id') || 0], function(error, results) {
              tx.abort(done);
              if(error) {
                logger.db.error(TAGS, error);
                return res.error(errors.internal.DB_FAILURE);
              }
              if (results.rowCount === 0) {
                // id didnt exist - no user found
                return res.status(404).end();
              } else {
                return res.error(errors.internal.UNKNOWN);
              }
            });
            return;
          }
          else {
            db.procedures.partialRegistration(req.params.id, result.rows[0].email, result.rows[0].password, result.rows[0].singlyId, client);
          }

          // are we done?
          if (typeof req.body.groups == 'undefined') {
            tx.commit(function(error){
              done(error);
              res.noContent();
            });
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
  if (!email) return res.error(errors.input.VALIDATION_FAILED, '`email` is required.');

  db.query('SELECT id FROM users WHERE email=$1', [email], function(error, rows, result) {
    if (error) {
      return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
    }
    if (result.rowCount === 0) {
      return res.error(errors.input.NOT_FOUND);
    }
    var userId = result.rows[0].id;

    var token = require("randomstring").generate();
    var query = sql.query([
      'INSERT INTO "userPasswordResets" ("userId", token, "createdAt")',
        'VALUES ($userId, $token, now())'
    ]);
    query.$('userId', userId);
    query.$('token', token);
    db.query(query, function(error, rows, result) {
      if(error) {
        return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      }

      var emailHtml = templates.email.reset_password({
        url : 'http://www.goodybag.com/#reset-password/' + token
      });
      utils.sendMail(email, config.emailFromAddress, 'Goodybag Password Reset Link', emailHtml);

      if (req.session.user && req.session.user.groups.indexOf('admin') !== -1)
        res.json({ err:null, data:{ token:token }});
      else
        res.noContent();
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
    var queryText = 'SELECT id, "userId" FROM "userPasswordResets" WHERE token=$1 AND "createdAt" > now() - INTERVAL \'20 minutes\' AND used IS NULL';
    db.query(queryText, [req.params.token], function(error, rows, result) {
      if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
      if (result.rowCount === 0)
        return res.error(errors.input.VALIDATION_FAILED, 'Your reset token was not found or has expired. Please request a new one.');
      var userId = result.rows[0].userId;
      var tokenId = result.rows[0].id;

      db.query('UPDATE users SET password=$1, "passwordSalt"=$2 WHERE id=$3', [encryptedPassword, passwordSalt, userId], function(error, rows, result) {
        if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        db.query('UPDATE "userPasswordResets" SET used=now() WHERE id=$1', [tokenId], function(error, rows, result) {
          if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

          res.noContent();
        });
      });
    });
  });
};


/**
 * Get email of partial registration
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.getPartialRegistrationEmail = function(req, res) {
  var TAGS = ['get-partial-registration', req.uuid];
  logger.routes.debug(TAGS, 'getting partial registration email for token: ' + req.params.token);

  db.api.partialRegistrations.findOne(
    {token:req.params.token, $null:['used']},
    {fields:['email'], $join:{users:{'partialRegistrations.userId':'users.id'}}},
    function(error, results) {
      if (error != null) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      if (results == null) return res.error(errors.auth.INVALID_PARTIAL_REGISTRATION_TOKEN), logger.routes.error(errors.auth.INVALID_PARTIAL_REGISTRATION_TOKEN);
      res.json({err: null, data: {email: results.email}});
    }
  );
}

/**
 * Complete partial registration
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.completeRegistration = function(req, res) {
  var TAGS = ['complete-partial-registration', req.uuid];
  logger.routes.debug(TAGS, 'completing partial registration for token: ' + req.params.token);

  var stage = {
    start: function(data) {
      if (req.body.code != null)
        oauth.authWithCode(req.body.code, function(error, user){
          if (error) return res.error(error), logger.routes.error(TAGS, error);
          if (data.email != null) user.email = data.email;
          data = user;
          stage.password(data);
        });
      else
        stage.password(data);
    },

    password: function(data) {
      if (req.body.password == null && (data.singlyAccessToken == null || data.singlyId == null))
        return res.send(400, 'you need to provide password or a facebook login'); //should be caught by validation
      if (req.body.password != null)
        utils.encryptPassword(req.body.password, function(error, encryptedPassword, passwordSalt) {
          data.password = encryptedPassword;
          data.passwordSalt = passwordSalt;
          stage.getUser(data);
        });
      else
        stage.getUser(data);
    },

    getUser: function(data) {
      db.api.partialRegistrations.findOne(
        {token:req.params.token, $null:['used']},
        {fields:['"userId"', 'email', '"cardId"'], $join:{users:{'partialRegistrations.userId':'users.id'}}},
        function(error, results) {
          if (error != null) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
          if (results == null) return res.error(errors.auth.INVALID_PARTIAL_REGISTRATION_TOKEN), logger.routes.error(errors.auth.INVALID_PARTIAL_REGISTRATION_TOKEN);
          if (data.email == null) data.email = results.email;
          data.cardId = results.cardId;
          if (data.userId == null) data.userId = results.userId;
          stage.update(data);
        }
      );
    },

    update: function(data) {
      db.getClient(TAGS, function(error, client, done){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        var tx = new Transaction(client);
        tx.begin(function(error) {
          if(error) {
            //destroy client on error
            done(error);
            return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
          }

          var useToken = sql.query('UPDATE "partialRegistrations" SET used=now() WHERE token=\'{token}\' AND used IS NULL RETURNING id');
          useToken.token = req.params.token;
          client.query(useToken.toString(), useToken.$values, function(error, results) {
            if (error != null) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error), tx.abort(done);
            if (results.rows == null || results.rows.length !== 1)
              return res.error(errors.auth.INVALID_PARTIAL_REGISTRATION_TOKEN), logger.routes.error(errors.auth.INVALID_PARTIAL_REGISTRATION_TOKEN), tx.abort(done);

            var userUpdates = {};
            var userColumns = ['email', 'password', 'singlyId', 'singlyAccessToken', 'cardId'];
            var consumerUpdates = {};
            var consumerColumns = ['screenName', 'firstName', 'lastName'];
            for (var key in data) {
              if (userColumns.indexOf(key) !== -1 && data[key] != null) userUpdates[key] = data[key];
              if (consumerColumns.indexOf(key) !== -1 && data[key] != null) consumerUpdates[key] = data[key];
            }

            var updateUser = sql.query('UPDATE users SET {updates} WHERE id={userId} RETURNING id, email');
            updateUser.userId = data.userId;
            var columns = [];
            for (var key in userUpdates)
              columns.push('"' + key +'"=\'' + userUpdates[key] + "'");
            updateUser.updates = columns.join(', ');

            client.query(updateUser.toString(), updateUser.$values, function(error, results) {
              if (error) {
                // postgres error code 23505 is violation of uniqueness constraint
                res.error(parseInt(error.code) === 23505 ? errors.registration.EMAIL_REGISTERED : errors.internal.DB_FAILURE, error);
                logger.routes.error(TAGS, error);
                tx.abort(done);
                return;
              }

              var sessionUser = (results.rows||0)[0];
              var returnSession = function() {
                tx.commit(function(error) {
                  done(error);
                  // Save user in session
                  req.session.user = sessionUser;

                  // use session cookie
                  req.session.cookie._expires = null;
                  req.session.cookie.originalMaxAge = null;

                  res.json({error: null, data:sessionUser});
                });
              }

              if (data.screenName != null || data.firstName != null || data.lastName != null) {
                var updateConsumer = sql.query('UPDATE consumers SET {updates} WHERE id={id}');
                updateConsumer.id = data.userId;

                var columns = [];
                for (var key in consumerUpdates)
                  columns.push('"' + key +'"=\'' + consumerUpdates[key] + "'");
                updateConsumer.updates = columns.join(', ');

                client.query(updateConsumer.toString(), updateConsumer.$values, function(error, results) {
                  if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error), tx.abort(done);
                  returnSession();
                });
              } else
                returnSession();
            });
          });
        });
      });
    }
  }

  var data = {email: req.body.email, screenName: req.body.screenName};
  stage.start(data);
}


/**
 * Create consumer cardupdate
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.createCardUpdate = function(req, res){
  var TAGS = ['create-consumer-cardupdate-token', req.uuid];
  logger.routes.debug(TAGS, 'creating consumer cardupdate token');

  var email = req.body.email;
  var newCardId = req.body.cardId;
  var query = 'SELECT users.id, users."cardId" FROM users WHERE users.email = $1';
  db.query(query, [email], function(error, rows, result) {
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
    db.query(query, function(error, rows, result) {
      if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var emailHtml = templates.email.cardupdate({
        url : 'http://www.goodybag.com/#/card-updates/' + token
      });

      utils.sendMail(email, config.emailFromAddress, 'Your New Goodybag Card', emailHtml);

      res.json({ err: null, data: { token:token }});
    });
  });
};

/**
 * Get card update
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.getCardUpdate = function(req, res){
  var TAGS = ['create-consumer-cardupdate-token', req.uuid];
  logger.routes.debug(TAGS, 'creating consumer cardupdate token');

  db.api.consumerCardUpdates.setLogTags(TAGS);

  var $query = {
    token: req.param('token')
  , $gt: { expires: 'now()' }
  };

  db.api.consumerCardUpdates.findOne($query, function(error, result){
    if (error)
      return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    if (!result)
      return res.status(404).end();

    res.json({ error: null, data: result });
  });
};

/**
 * Delete card update
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.deleteCardUpdate = function(req, res){
  var TAGS = ['create-consumer-cardupdate-token', req.uuid];
  logger.routes.debug(TAGS, 'creating consumer cardupdate token');

  db.api.consumerCardUpdates.setLogTags(TAGS);

  var $query = {
    token: req.param('token')
  , $gt: { expires: 'now()' }
  };

  var $update = { expires: 'now()' };

  var options = { returning: ['id'] };

  db.api.consumerCardUpdates.update($query, $update, options, function(error, results){
    if (error)
      return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    if (!results || !results.length)
      return res.status(404).end();

    res.status(204).end();
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

  var query = [
    'select '
  , '  "consumerCardUpdates"."userId" as "userAId"'
  , ', "consumerCardUpdates"."newCardId"'
  , ', users.id as "userBId"'
  , 'from "consumerCardUpdates"'
  , 'left join users on users."cardId" = "consumerCardUpdates"."newCardId"'
  , 'where token = $1 and expires > now()'
  ].join('\n');

  // get cardupdate info
  db.query(query, [req.params.token], function(error, rows, result) {
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    if (result.rowCount === 0) return res.status(404).end();

    if (result.rows[0].userBId){
      var options = { userMerge: ['cardId'] };
      db.procedures.mergeAccounts(result.rows[0].userAId, result.rows[0].userBId, options, function(error){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        return res.noContent();
      });
    } else {
      var targetConsumerId = result.rows[0].userAId;
      var newCardId = result.rows[0].newCardId;

      db.query('UPDATE users SET "cardId"=$1 WHERE id = $2', [newCardId, targetConsumerId], function(error, rows, result) {
        if(error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        res.noContent();
      });
    }
  });
};
