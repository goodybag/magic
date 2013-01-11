var db = require('../../db');
var users = db.tables.users;
var usersGroups = db.tables.usersGroups;

module.exports = {
  "default": {
    id       : users.id
  , email    : users.email
  , password : users.password
  , groups   : true
  , $postRequires : ['email', 'password']
  }
, client: {
    id       : users.id
  , email    : users.email
  , password : users.password
  , groups   : true
  , $postRequires : ['email', 'password']
  }
, sales: {
    id       : users.id
  , email    : users.email
  , password : users.password
  , groups   : true
  , $postRequires : ['email', 'password']
  }
, owner: {
    id       : users.id
  , email    : users.email
  , password : users.password
  , groups   : true
  , $postRequires : ['email', 'password']
  }
, admin: {
    id       : users.id
  , email    : users.email
  , password : users.password
  , groups   : true
  , $postRequires : ['email', 'password']
  }
};