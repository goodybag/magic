/**
 * Groups
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
 * Get group
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-groups', req.uuid];
  logger.routes.debug(TAGS, 'fetching groups ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    // build query
    // :TODO: nuke this fields kludge
    var fields = [];
    for (var field in req.fields) {
      if (field === 'users') {
        fields.push('array_agg("usersGroups"."userId") as users');
      } else {
        fields.push('groups.' + field + ' AS ' + field);
      }
    }
    var query = [
      'SELECT', fields.join(', '), 'FROM groups',
      'LEFT JOIN "usersGroups" ON "usersGroups"."groupId" = groups.id',
      'WHERE groups.id = $1',
      'GROUP BY groups.id'
    ].join(' ');

    client.query(query, [(+req.param('id')) || 0], function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);
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
 * List groups
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-groups', req.uuid];
  logger.routes.debug(TAGS, 'fetching groups', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = utils.selectAsMap(groups, req.fields)
      .from(groups);

    client.query(query.toQuery(), function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: result.rows });
    });
  });
};

/**
 * Create groups
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-groups', req.uuid];
  logger.routes.debug(TAGS, 'creating group', {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    // start transaction
    var tx = new Transaction(client);
    tx.begin(function() {

      // build query
      var group = {
        name:    req.body.name
      , users:   req.body.users
      };
      var query = 'INSERT INTO groups (name) VALUES ($1) RETURNING id';
      client.query(query, [group.name], function(error, result) {
        if(error) return res.json({error:error, data: result}), tx.abort(), logger.routes.error(TAGS, error);
        var newGroup = result.rows[0];

        // add users
        async.series((group.users || []).map(function(userId) {
          return function(done) {
            var query = 'INSERT INTO "usersGroups" ("groupId", "userId") SELECT $1, $2 FROM users WHERE users.id = $2';
            client.query(query, [newGroup.id, userId], done);
          }
        }), function(err, results) {
          // did any insert fail?
          if (err || results.filter(function(r) { return r.rowCount === 0; }).length !== 0) {
            // the target user must not have existed
            tx.abort();
            return res.error(errors.input.INVALID_USERS);
          }

          tx.commit();
          return res.json({ error: null, data: newGroup });
        });
      });
    });
  });
};

/**
 * Delete group
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-group', req.uuid];
  logger.routes.debug(TAGS, 'deleting group ' + req.params.id, {uid: 'more'});

  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    var query = groups.delete().where(
      groups.id.equals(+req.param('id') || 0)
    ).toQuery();

    client.query(query.text, query.values, function(error, result){
      if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

      logger.db.debug(TAGS, result);

      return res.json({ error: null, data: null });
    });
  });
};

/**
 * Update group
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-group', req.uuid];
  db.getClient(function(error, client){
    if (error) return res.json({ error: error, data: null }), logger.routes.error(TAGS, error);

    // start transaction
    var tx = new Transaction(client);
    tx.begin(function() {

      var group = {
        name    : req.body.name,
        users   : req.body.users
      };

      // build update query
      var query = [
        'UPDATE groups SET',
        '  name =', (group.name) ? '$2' : 'name', 
        'WHERE groups.id = $1'
      ].join(' ');
      logger.db.debug(TAGS, query);

      // run update query
      client.query(query, [+req.param('id') || 0].concat(group.name || []), function(error, result){
        if (error) return res.json({ error: error, data: null }), tx.abort(), logger.routes.error(TAGS, error);
        logger.db.debug(TAGS, result);

        // did the update occur?
        if (result.rowCount === 0) {
          tx.abort();
          // id didnt exist
          return res.status(404).end();
        }

        // delete all user relations
        var query = usersGroups.delete()
          .where(usersGroups.groupId.equals(req.param('id')));
        client.query(query.toQuery(), function(error, result) {
          if (error) return res.json({ error: error, data: null }), tx.abort(), logger.routes.error(TAGS, error);

          // add new user relations
          async.series((group.users || []).map(function(userId) {
            return function(done) {
              var query = 'INSERT INTO "usersGroups" ("groupId", "userId") SELECT $1, $2 FROM users WHERE users.id = $2';
              client.query(query, [req.param('id'), userId], done);
            }
          }), function(err, results) {
            // did any insert fail?
            if (err || results.filter(function(r) { return r.rowCount === 0; }).length !== 0) {
              // the target user must not have existed
              tx.abort();
              return res.error(errors.input.INVALID_USERS);
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
