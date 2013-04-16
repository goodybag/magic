var
  http = require('http')
, config = require('../config')
, utils = require('./utils')
, baseUrl = config.baseUrl
, cookie
;

exports.tapinAuthRequest = function(method, url, cardId, data, callback){
  if (typeof data === "function"){
    callback = data;
    data = null;
  }

  var headers = {
    'authorization': 'Tapin '+cardId
  };
  if (data) {
    headers['content-type'] = 'application/json';
  }

  exports.httpRequest({
    method: method
  , path: url
  , headers: headers
  }, (data) ? JSON.stringify(data) : null, callback);
};

exports.createTestOauthUser = function(callback){
  // Get new facebook app access token
  utils.get(config.facebook.accessTokenUrl, { json: false }, function(error, response, results){
    if (error) return callback(error);
    if (results.indexOf('access_token') === -1)
      return callback(new Error("Invalid response from facebook while trying to get app access token"));

    var fbAppToken = results.split('=')[1];

    // Make new facebook test user
    var options = {};
    options['User-Agent'] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.52 Safari/537.17";
    utils.get(config.facebook.testUserUrl(fbAppToken), options, function(error, response, results){
      if (error) return callback(error);

      // Apply to singly
      utils.get(config.singly.applyFacebookTokenUrl(results.access_token), function(error, response, results){
        if (error) return callback(error);
        return callback(null, results);
      });
    });
  });
};

exports.loginAsAdmin = function(callback){
  exports.login({ email: 'admin@goodybag.com', password: 'password' }, callback);
};

exports.loginAsSales = function(callback){
  exports.login({ email: 'sales@goodybag.com', password: 'password' }, callback);
};

exports.login = function(user, callback){
  exports.post('/v1/session', user, function(error, results, res){
    try {
      results = JSON.parse(results);
    } catch (e) {
      console.log('Failed to parse login response:', results);
    }
    callback(error || results.error, results.data);
  });
};

exports.loginAsConsumer = function(callback){
  exports.login({ email: 'tferguson@gmail.com', password: 'password' }, callback);
};

exports.loginAsClient = function(callback){
  exports.login({ email: 'client@goodybag.com', password: 'password' }, callback);
};

exports.loginAsTablet = function(callback){
  exports.login({ email: 'tablet@goodybag.com', password: 'password' }, callback);
};

exports.logout = function(callback){
  exports.del('/v1/session', callback);
};

exports.get = function get(path, cb) {
  exports.httpRequest({ path:path }, null, cb);
};

exports.post = function post(path, payload, ctype, cb) {
  if (typeof payload === "object") payload = JSON.stringify(payload);
  if (typeof ctype === "function" || typeof ctype === "undefined") cb = ctype, ctype = 'application/json';
  exports.httpRequest({ method:'POST', path:path, headers:{ 'Content-type':ctype }}, payload, cb);
};

exports.put = function put(path, payload, ctype, cb) {
  if (typeof payload === "object") payload = JSON.stringify(payload);
  if (typeof ctype === "function") cb = ctype, ctype = 'application/json';
  exports.httpRequest({ method:'PUT', path:path, headers:{ 'Content-type':ctype }}, payload, cb);
};

exports.patch = function patch(path, payload, ctype, cb) {
  if (typeof payload === "object") payload = JSON.stringify(payload);
  if (typeof ctype === "function") cb = ctype, ctype = 'application/json';
  exports.httpRequest({ method:'PUT', path:path, headers:{ 'Content-type':ctype }}, payload, cb);
};

exports.del = function del(path, cb) {
  exports.httpRequest({ method:'DELETE', path:path }, null, cb);
};

exports.populate = function populate(type, items, cb) {
  if (Array.isArray(items) === false) throw "batch `items` must be an array of objects";
  if (type.slice(-1) != 's') type = type + 's'; // make sure type is plural

  exports.loginAsAdmin(function(err,res) {
    var ids = [];
    var nextRequest = function() {
      var item = items.shift();
      if (!item) return exports.logout(function() { cb(null, ids); });
      exports.post('/v1/'+type, item, function(err, results, res) {
        if (err || res.statusCode > 299) {
          console.log('Error while populating:', results);
          return exports.logout(function() { cb(err || results); });
        }
        ids.push(JSON.parse(results).data.id);
        nextRequest();
      });
    };
    nextRequest();
  });
};

exports.depopulate = function depopulate(type, ids, cb) {
  if (Array.isArray(ids) === false) throw "batch `ids` must be an array of scalars";
  if (type.slice(-1) != 's') type = type + 's'; // make sure type is plural

  exports.loginAsAdmin(function() {
    var nextRequest = function() {
      var id = ids.shift();
      if (!id) return exports.logout(function() { cb(null); });
      exports.del('/v1/'+type+'/'+id, function(err, results, res) {
        if (err || res.statusCode > 299) {
          console.log('Error while populating:', results);
          return exports.logout(function() { cb(err || results); });
        }
        nextRequest();
      });
    };
    nextRequest();
  });
};

exports.httpRequest = function httpRequest(options, payload, cb) {
  cb = cb || function(){};
  options = options || {};
  options.hostname = options.hostname || 'localhost';
  options.port     = options.port || 8986;
  options.method   = options.method || 'GET';
  options.accept   = options.accept || 'application/json';
  options.headers  = options.headers || {'user-agent':'magic-test-utils'};
  options.headers.cookie = cookie || "";

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
    console.log('REQUEST ERROR', e)
    cb(e);
  });
  if (payload) {
    req.write(payload);
  }
  req.end();
};

exports.arrHas = function arrHas(arr, k, v, n) {
  return arr.filter(function(i) { return i[k] === v; }).length === (n || 1);
};
exports.arrHasOnly = function arrHasOnly(arr, k, v) {
  return arr.filter(function(i) { return i[k] !== v; }).length === 0;
};
