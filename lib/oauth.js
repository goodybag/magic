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
    authWithToken(token, callback);
  });
}

var authWithToken = module.exports.authWithToken = function(singlyToken, callback) {
  singly.get('/profiles', {access_token: singlyToken}, function(error, result) {
    if (error) return callback(error);
    authWithTokenAndId(singlyToken, results.body.id, callback);
  });
}


var authWithTokenAndId = module.exports.authWithTokenAndId = function(singlyToken, singlyId, callback) {
  singly.get('/profiles/facebook', { access_token: singlyToken }, function(error, result) {
    if (error) return callback(error);

    var user = {
      singlyId: singlyId,
      singlyAccessToken: singlyToken
    }

    if (!result.body.facebook) return callback(null, user);

    user.firstName = result.body.data.first_name;
    user.lastName  = result.body.data.last_name;

    var $query  = { facebookId: result.body.data.id, $null: ['pending'] };
    var $update = { pending: false };
    var options = { returning: ['userId'] };

    db.api.pendingFacebookUsers.update($query, $update, options, function(error, results){
      if (error) return callback(error);
      if (results.rows.length === 1)
        user.id = results.rows[0].userId;
      callback(null, user);
    });
  });
}
