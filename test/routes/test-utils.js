var http = require('http');

exports.get = function get(path, cb) {
  exports.httpRequest({ path:path }, null, cb);
};

exports.post = function post(path, payload, cb) {
  exports.httpRequest({ path:path }, payload, cb);
};

exports.httpRequest = function httpRequest(options, payload, cb) {
  options = options || {};
  options.hostname = 'localhost';
  options.port     = 8986;
  options.method   = options.method || 'GET';

  var req = http.request(options, function(res) {
    var resPayload = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) { resPayload += chunk; });
    res.on('end', function() { cb(null, resPayload, res); });
  });
  req.on('error', function(e) {
    cb(e);
  });
  if (payload) {
    req.write(payload);
  }
  req.end();
};