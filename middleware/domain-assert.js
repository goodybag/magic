var assert = require('assert');
//for dev/test we can assert the request has not left the domain
//if the request.uuid differs from the domain.uui something very
//bad has happened...crash everything
var domainAssert = module.exports = function(req, res, next) {
  var end = res.end;
  res.end = function() {
    assert(req.uuid, 'request should have a uuid');
    assert(process.domain, 'request context for ' + req.method + ' ' + req.url + ' has detached from a domain');
    if(req.uuid != process.domain.uuid) {
      console.log();
      console.log('req uuid    ', req.uuid, req.method, req.url);
      console.log('domain uuid ', (process.domain||0).uuid);
      assert(process.domain === req.domain, "Domain detached from request");
    }
    end.apply(this, arguments);
  };
  next();
};
