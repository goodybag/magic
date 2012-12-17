var http = require('http'), cookie;

exports.get = function get(path, cb) {
  exports.httpRequest({ path:path }, null, cb);
};

exports.post = function post(path, payload, ctype, cb) {
  if (typeof payload === "object") payload = JSON.stringify(payload);
  if (typeof ctype === "function") cb = ctype, ctype = 'application/json';
  exports.httpRequest({ method:'POST', path:path, headers:{ 'Content-type':ctype }}, payload, cb);
};

exports.put = function post(path, payload, ctype, cb) {
  if (typeof payload === "object") payload = JSON.stringify(payload);
  if (typeof ctype === "function") cb = ctype, ctype = 'application/json';
  exports.httpRequest({ method:'PUT', path:path, headers:{ 'Content-type':ctype }}, payload, cb);
};

exports.patch = function post(path, payload, ctype, cb) {
  if (typeof payload === "object") payload = JSON.stringify(payload);
  if (typeof ctype === "function") cb = ctype, ctype = 'application/json';
  exports.httpRequest({ method:'PATCH', path:path, headers:{ 'Content-type':ctype }}, payload, cb);
};

exports.del = function get(path, cb) {
  exports.httpRequest({ method:'DELETE', path:path }, null, cb);
};

exports.httpRequest = function httpRequest(options, payload, cb) {
  options = options || {};
  options.hostname = 'localhost';
  options.port     = 8986;
  options.method   = options.method || 'GET';
  options.accept   = options.accept || 'application/json';
  options.cookie   = cookie || "";

  var req = http.request(options, function(res) {
    var resPayload = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) { resPayload += chunk; });
    res.on('end', function() { cb(null, resPayload, res); });

    // Set cookie
    if (res.headers['set-cookie']){
      // For now, just be dumb and set the whole cookie - whatever
      cookie = res.headers['set-cookie'][0].split(';')[0];
    }
  });
  req.on('error', function(e) {
    cb(e);
  });
  if (payload) {
    req.write(payload);
  }
  req.end();
};