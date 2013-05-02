var db     = require('../db');
var config = require('../config');

//singly variables
var clientId     = config.singly.clientId;
var clientSecret = config.singly.clientSecret;
var callbackUrl  = config.singly.callbackUrl;
var apiBaseUrl   = config.singly.apiBaseUrl;
var singly       = require('singly')(clientId, clientSecret,callbackUrl);

var authWithCode = module.exports.authWithCode = function(code, callback) {
  singly.getAccessToken(code, function(error, response, token) {
    if (error || token.error) return callback(error || token.error);
    authWithTokenAndId(token.access_token, token.account, callback);
  });
}

var authWithToken = module.exports.authWithToken = function(singlyToken, callback) {
  singly.get('/profiles', {access_token: singlyToken}, function(error, result) {
    if (error) return callback(error);
    authWithTokenAndId(singlyToken, result.body.id, callback);
  });
}


var authWithTokenAndId = module.exports.authWithTokenAndId = function(singlyToken, singlyId, callback) {
  var user = {
    singlyId: singlyId,
    singlyAccessToken: singlyToken
  }

  singly.get('/profiles/facebook', { access_token: singlyToken }, function(error, result) {
    if (result.statusCode === 404) return callback(null, user);

    if (error) return callback(error);

    user.firstName = result.body.data.first_name;
    user.lastName  = result.body.data.last_name;

    var $query  = { facebookId: result.body.data.id, $null: ['pending'] };
    var $update = { pending: false };
    var options = { returning: ['userId'] };

    db.api.pendingFacebookUsers.update($query, $update, options, function(error, results){
      if (error) return callback(error);
      if (results.rows != null && results.rows.length === 1)
        user.id = results.rows[0].userId;
      callback(null, user);
    });
  });
}
