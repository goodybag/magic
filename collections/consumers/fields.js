var db = require('../../db');
var users = db.tables.users;
var usersGroups = db.tables.usersGroups;
var consumers = db.tables.consumers;

module.exports = {
  "default": {
    id          : users.id
  , email       : users.email
  , password    : users.password
  , firstName   : consumers.firstName
  , lastName    : consumers.lastName
  , screenName  : consumers.screenName
  , tapinId     : consumers.tapinId
  , $postRequires : ['email', 'password']
  }
};