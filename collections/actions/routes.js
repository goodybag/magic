var
  db      = require(__dirname + '/../../db')
, util    = require('util')
, logger  = {}
;

// Setup loggers
logger.routes = require('../../lib/logger')({app: 'api', component: 'routes'});
logger.db = require('../../lib/logger')({app: 'api', component: 'db'});

var actions = db.tables.actions;

//insert actions for the request body
var insertActions = function(body) {
  //can insert an array of actions
  if(util.isArray(body)) {
    for(var i = 0; i < body.length; i++) {
      insertActions(body[i]);
    }
    return;
  }
  if(!body || !body.type) return;
  //clean posted body
  var row = {
    type: body.type,
    dateTime: body.dateTime || new Date(),
    userId: body.userId,
    productId: body.productId,
    source: body.source,
    sourceVersion: body.sourceVersion,
    deviceId: body.deviceId,
    locationId: body.locationId,
    data: body.data
  };
  db.query(actions.insert(row), function(err, rows, result) {
    if(err) logger.error(err);
  });
}

/**
 * Get event
 * @param  {Object} req HTTP Request Object
 * @param  {Object} res HTTP Result Object
 */
module.exports.post = function(req, res){
  //return 204 no content right away
  //send empty json because some http clients can't
  //handle how awesome 204 is without a response body
  res.writeHead(204, {'content-type':'application/json'});
  res.end('{}');
  var body = req.body;
  process.nextTick(function() {
    insertActions(body);
  });
};
