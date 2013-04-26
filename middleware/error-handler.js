var log = require(__dirname + '/../lib/logger')({app: 'api', component: 'errorHandler'});
//the terminal error handler
//nothing passes this point.
var errorHandler = module.exports = function(app) {
  return function(err, req, res, next) {
    delete err.domain;
    //respond kindly to the offender if possible
    log.error(err, err.stack);
    try {
      var errorHeaders = {
        'content-type':'application/json', 
        'connection': 'close'
      };
      res.writeHead(500, errorHeaders);
      res.end(JSON.stringify({error: errors.internal.UNKNOWN, data: null}));
    } catch(e) {
      delete e.domain;
      log.warn('failed to end response', e);
    }
    if(app.shutdown) {
      app.shutdown();
    } else {
      log.warn('app has no shutdown handler - not cleaning up properly after error');
    }
  };
};
