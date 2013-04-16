var db = require ('../db');
var requests = db.tables.requests;

module.exports = function() {
  return function(req, res, next) {
    var headers = {};
    for (k in req.headers)
      headers[k.toLowerCase()] = req.headers[k];

    var TAGS = ['middleware-request-logger', req.uuid];

    db.api.requests.setLogTags(TAGS);

    db.api.requests.insert({
      uuid:req.uuid,
      userId:req.session.user != null ? req.session.user.id : null,
      httpMethod:req.method,
      url:req.url,
      application:headers['application'],
      userAgent:headers['user-agent'],
      createdAt:(new Date()).toISOString()
    }, {returning:false});

    next();
  }
}
