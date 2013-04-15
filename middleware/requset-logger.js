var db = require ('../db');
var requests = db.tables.requests;

module.exports = function() {
  return function(req, res, next) {
    var headers = {};
    for (k in req.headers)
      headers[k.toLowerCase()] = req.headers[k];

    var TAGS = ['middleware-request-logging', req.uuid];

    db.getClient(TAGS, function(error, client) {
      if (error)
        return; //TODO: error handling

      var query = 'INSERT INTO requests ("uuid", "userId", "method", "url", "application", "userAgent")';
      var values = [req.uuid, req.session.user.id, req.method, req.url, headers['application'], headers['user-agent']];
      client.query(query, values, null);
    });

    next();
  }
}
