var 
  logger = {
    middleware: require('../lib/logger')({app: 'api', component: 'middleware'})
  }
;

var attachFilteredHeaders = function(meta, headers) {
  for(var key in headers) {
    //do not log out auth information
    if(key == 'set-cookie' || key == 'cookie' || key == 'authorization') continue;
    meta['header-' + key] = headers[key];
  }
}

var logRequest = function(req) {
  //flatten meta for graylog2
  var meta = { };
  meta.address = req.socket.address().address;
  attachFilteredHeaders(meta, req.headers);
  for(var key in req.params) {
    meta['param-'+key] = req.params[key];
  }

  for(var key in req.query) {
    meta['query-'+key] = req.query[key];
  }

  if(req.body && typeof req.body == 'object') {
    //scrub json body and log it
    for(var key in req.body) {
      if(!req.body.hasOwnProperty(key)) continue;
      if(key == 'password' || key == 'singlyAccessToken' || key == 'code' || key == 'cardId') continue;
      meta['body-' + key] = req.body[key];
    }
  }

  logger.middleware.debug('request','request', meta);
};

var logResponse = function(res, start) {
  var meta = {};
  attachFilteredHeaders(meta, res.headers);
  meta.duration = new Date()-start;
  meta.statusCode = res.statusCode;
  logger.middleware.debug('response', 'response', meta);
};

module.exports = function(req, res, next){
  var start = new Date();
  logRequest(req);

  var responseEndFn = res.end;
  res.end = function(chunk, encoding) {
    responseEndFn.call(this, chunk, encoding);
    logResponse(res, start);
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
