var 
  logger = {
    middleware: require('../lib/logger')({app: 'api', component: 'middleware'})
  }
;

module.exports = function(req, res, next){
  var TAGS = [req.uuid, 'dump'];

  logger.middleware.debug(TAGS, {
    dump: 'request'
  , url: req.url
  , method: req.method
  , headers: req.headers
  , params: req.params
  , query: req.query
  , body: req.body
  });

  var responseEndFn = res.end;
  res.end = function(chunk, encoding) {
    responseEndFn.call(this, chunk, encoding);

    var resheaders = utils.clone(res._headers);
    resheaders.statusCode = res.statusCode;
    resheaders.dump = 'response';
    logger.middleware.debug(TAGS, resheaders);
  };

  next();
};
