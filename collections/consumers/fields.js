var db = require('../../db');
var users = db.tables.users;
var usersGroups = db.tables.usersGroups;
var consumers = db.tables.consumers;

module.exports = {
  "default": {
    id                : users.id
  , email             : users.email
  , password          : users.password
  , singlyId          : users.singlyId
  , singlyAccessToken : users.singlyAccessToken
  , consumerId        : consumers.id
  , firstName         : consumers.firstName
  , lastName          : consumers.lastName
  , screenName        : consumers.screenName
  , cardId            : consumers.cardId
  , $postRequires : function(req, res){
      if (req.body.email) return ['email', 'password'];
      return ['singlyAccessToken', 'singlyId'];
    }
  }
};