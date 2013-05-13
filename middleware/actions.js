var util = require('util');
var logger = require(__dirname + '/../lib/logger')('actions');
var express = require('express');

var db = require(__dirname + '/../db');

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

var actionsApp = module.exports = express();

actionsApp.post('/v1/actions', function(req, res, next) {
  //return 204 no content right away
  //send empty json because some http clients can't
  //handle how awesome 204 is without a response body
  res.writeHead(204, {'content-type':'application/json'});
  res.end('{}');
  var body = req.body;
  process.nextTick(function() {
    insertActions(body);
  });
});
