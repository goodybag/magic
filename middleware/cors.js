/*
  CORS Middleware
*/

var corsHeaders = function(options) {
  return function(req, res, next) {
    options = options || {};
    res.setHeader('Access-Control-Allow-Origin',      '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods',     options.methods       || 'OPTIONS, HEAD, GET');
    res.setHeader('Access-Control-Allow-Headers',     options.allowHeaders  || 'Content-type');
    res.setHeader('Access-Control-Expose-Headers',    options.exposeHeaders || 'Allow, Link, Content-type');
    next();
  };
};
module.exports = corsHeaders;