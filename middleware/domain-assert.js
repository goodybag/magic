var assert = require('assert');
//for dev/test we can assert the request has not left the domain
//if the request.uuid differs from the domain.uui something very
//bad has happened...crash everything
var domainAssert = module.exports = function(req, res, next) {
  var end = res.end;
  res.end = function() {
    assert(req.uuid, 'request should have a uuid');
    assert(process.domain, 'request context for ' + req.method + ' ' + req.url + ' has detached from a domain');
    assert.equal(req.uuid, process.domain.uuid, 'request uuid ' + req.uuid + ' != domain uuid ' + process.domain.uuid);
    end.apply(this, arguments);
  };
  next();
};
