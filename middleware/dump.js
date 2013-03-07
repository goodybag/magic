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
  , headers: filterHeaders(req.headers)
  , params: req.params
  , query: req.query
  , body: filterRequestBody(req.body)
  });

  var responseEndFn = res.end;
  res.end = function(chunk, encoding) {
    responseEndFn.call(this, chunk, encoding);

    var resheaders = filterHeaders(res._headers);
    resheaders.statusCode = res.statusCode;
    resheaders.dump = 'response';
    logger.middleware.debug(TAGS, resheaders);
  };

  next();
};

function filterHeaders(headers) {
  headers = utils.clone(headers);
  delete headers['set-cookie'];
  delete headers['cookie'];
  delete headers['authorization'];
  return headers;
}

function filterRequestBody(body) {
  if (typeof body != 'object' || !body)
    return null; // only log if we get a chance to scrub
  body = utils.clone(body);
  delete body['password'];
  delete body['singlyAccessToken'];
  delete body['code'];
  delete body['cardId'];
  return body;
}