/*
  CORS Middleware
*/

var corsHeaders = function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin',      req.headers['origin']); // req.headers['origin'] is necessary to get authorization to work
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods',     'OPTIONS, HEAD, GET, PUT, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers',     'Content-type, Authorization');
  res.setHeader('Access-Control-Expose-Headers',    'Allow, Link, Content-type');

  // intercept OPTIONS method, this needs to respond with a zero length response (pre-flight for CORS).
  if (req.method == 'OPTIONS') { return res.send(200); }
  next();
};
module.exports = corsHeaders;