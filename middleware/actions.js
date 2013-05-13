var express = require('express');

var db = require(__dirname + '/../db');

var actions = db.tables.actions;

var validBody = function(body) {
  return body && body.type;
};

var actionsApp = module.exports = express();

actionsApp.post('/v1/actions', function(req, res, next) {
  //return 204 no content right away
  //send empty json because some http clients can't
  //handle how awesome 204 is without a response body
  res.writeHead(204, {'content-type':'application/json'});
  res.end('{}');
  var body = req.body;
  if(validBody(body)) {
    process.nextTick(function() {
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
        if(err) console.log(err);
      });
    });
  }
})


