/**
 * tapinStations
 */

var
  singly  = require('singly')

, db      = require('../../db')
, sql     = require('../../lib/sql')
, utils   = require('../../lib/utils')
, errors  = require('../../lib/errors')
, config  = require('../../config')

, magic   = require('../../lib/magic')

, logger  = {}
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

/**
 * Get tapinStation
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.get = function(req, res){
  var TAGS = ['get-tapinStations', req.uuid];
  logger.routes.debug(TAGS, 'fetching tapinStation ' + req.params.id);

  var query = sql.query([
    'SELECT {fields} FROM users',
      'LEFT JOIN "tapinStations" ON "tapinStations".id = users.id',
      'WHERE users.id = $id'
  ]);
  query.fields = sql.fields().add('users.*');
  query.fields.add('"tapinStations".*');

  query.$('id', +req.param('id') || 0);

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    if (result.rowCount == 1) {
      return res.json({ error: null, data: result.rows[0] });
    } else {
      return res.status(404).end();
    }
  });
};

/**
 * List tapinStations
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.list = function(req, res){
  var TAGS = ['list-tapinStations', req.uuid];
  logger.routes.debug(TAGS, 'fetching tapinStations ' + req.params.id);

  // build data query
  var query = sql.query([
    'SELECT {fields} FROM "tapinStations"',
      'INNER JOIN users ON "tapinStations".id = users.id',
      '{where} {limit}'
  ]);
  query.fields = sql.fields().add('users.*');
  query.fields.add('"tapinStations".*');

  query.where  = sql.where();
  query.limit  = sql.limit(req.query.limit, req.query.offset);

  if (req.param('filter')) {
    query.where.and('users.email ILIKE $emailFilter');
    query.$('emailFilter', '%'+req.param('filter')+'%');
  }

  if (req.param('businessId')) {
    query.where.and('"tapinStations"."businessId" = $businessId');
    query.$('businessId', req.param('businessId'));
  }

  if (req.param('locationId')) {
    query.where.and('"tapinStations"."locationId" = $locationId');
    query.$('locationId', req.param('locationId'));
  }

  query.fields.add('COUNT(*) OVER() as "metaTotal"');

  // run data query
  db.query(query, function(error, rows, dataResult){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var total = (dataResult.rows[0]) ? dataResult.rows[0].metaTotal : 0;
    return res.json({ error: null, data: dataResult.rows, meta: { total:total } });
  });
};

/**
 * Create tapinStations
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.create = function(req, res){
  var TAGS = ['create-tapinStations', req.uuid];
  logger.routes.debug(TAGS, 'creating tapinStation');

  db.procedures.setLogTags(TAGS);
  db.procedures.registerUser('tapin-station', req.body, function(error, result){
    if (error) return res.error(error, result), logger.routes.error(TAGS, result);

    res.json({ error: null, data: result });
    magic.emit('tapin-stations.registered', result);
  });
};

/**
 * Delete tapin station
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.del = function(req, res){
  var TAGS = ['del-tapinStation', req.uuid];
  logger.routes.debug(TAGS, 'deleting tapinStation ' + req.params.id);

  var query = sql.query('DELETE FROM users WHERE users.id = $id');
  query.$('id', +req.params.id || 0);

  db.query(query, function(error, rows, result){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
    if (result.rowCount === 0) return res.status(404).end();

    return res.json({ error: null, data: null });
  });
};

/**
 * Update tapinStation
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res [description]
 */
module.exports.update = function(req, res){
  var TAGS = ['update-tapinStation', req.uuid];
  logger.routes.debug(TAGS, 'updating tapin-station ' + req.params.userId);

  var userId = req.param('id');
  if (userId == 'session')
    userId = req.session.user.id;

  db.procedures.setLogTags(TAGS);
  db.procedures.updateUser('tapin-station', userId, req.body, function(error, result) {
    if (error) return res.error(error, result), logger.routes.error(TAGS, result);
    res.noContent();
    magic.emit('tapinstations.update', userId, req.body);
  });
};

module.exports.listHeartbeats = function(req, res){
  var TAGS = ['list tapinStations-heartbeats', req.uuid];

  var
    query   = {}
  , fields  = db.fields.heartbeats.quoted.exclude('data')

  , options = {
      order:  '"createdAt" desc'
    , limit:  30
    , offset: 0
    , fields: fields.concat('to_json(data) as data')
    }
  ;

  if (req.param('id'))              query.userId      = req.param('id');
  if (req.param('userId'))          query.userId      = req.param('userId');
  if (req.param('tapinStationId'))  query.userId      = req.param('tapinStationId');

  if (req.param('businessId'))      query.businessId  = req.param('businessId');
  if (req.param('locationId'))      query.locationId  = req.param('locationId');

  if (req.param('limit'))           options.limit     = req.param('limit');
  if (req.param('offset'))          options.offset    = req.param('offset');

  if (req.param('type'))            query.type        = req.param('type');

  db.api.heartbeats.setLogTags(TAGS);
  db.api.heartbeats.find(query, options, function(error, results, meta){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    results = results.map(function(r){
      try {
        r.data = JSON.parse(r.data);
      } catch (e) {
        r.data = null;
      }
      return r;
    });

    return res.json({ error: null, data: results, meta: meta });
  });
};

/**
 * Emit heartbeat
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.createHeartbeat = function(req, res){
  var TAGS = ['tapinStations-heartbeat', req.uuid];
  logger.routes.debug(TAGS, 'emitting tapinStation ' + req.params.id + ' heartbeat');

  var query = sql.query('SELECT "businessId", "locationId" FROM "tapinStations" WHERE id = $id');
  query.$('id', +req.param('id') || 0);

  db.query(query.toString(), query.$values, function(error, results){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    if (results.length == 0) return res.error(errors.input.NOT_FOUND);

    var heartbeat = {
      userId:     req.param('id')
    , locationId: results[0].locationId
    , businessId: results[0].businessId
    , data:       JSON.stringify(req.body)
    , type:       req.body.type
    };

    var options = {
      returning: false
    };

    db.api.heartbeats.insert(heartbeat, options, function(error){
      if (error) return res.error(errors.internal.DB_FAILURE, error)

      res.send(204);
    });
  });
};
