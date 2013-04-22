var log = require(__dirname + '/../lib/logger')({app: 'api', component: 'errorHandler'});
//the terminal error handler
//nothing passes this point.
var errorHandler = module.exports = function(app) {
  return function(err, req, res, next) {
    delete err.domain;
    //respond kindly to the offender if possible
    try {
      res.writeHead(500, {'content-type':'application/json', 'connection': 'close'});
      res.end(JSON.stringify({error: errors.internal.UNKNOWN, data: null}));
    } catch(e) {
      delete e.domain;
      log.warn('failed to end response', e);
    }
    app.shutdown();
  };
};
