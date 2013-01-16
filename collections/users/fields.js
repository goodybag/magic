var db = require('../../db');
var users = db.tables.users;
var usersGroups = db.tables.usersGroups;

module.exports = {
  access:{
    "default": {
      id       : users.id
    , email    : users.email
    , groups   : true
    }
  , client: {
      id       : users.id
    , email    : users.email
    , groups   : true
    }
  , sales: {
      id       : users.id
    , email    : users.email
    , groups   : true
    }
  , owner: {
      id       : users.id
    , email    : users.email
    , password : users.password
    , groups   : true
    }
  , admin: {
      id       : users.id
    , email    : users.email
    , password : users.password
    , groups   : true
    }
  },
  create:{
    "default": {
      email    : users.email
    , password : users.password
    , $postRequires : ['email', 'password']
    }
  , admin: {
      email    : users.email
    , password : users.password
    , groups   : true
    , $postRequires : ['email', 'password']
    }
  },
  mutate:{
    owner: {
      email    : users.email
    , password : users.password
    , groups   : true
    }
  , admin: {
      email    : users.email
    , password : users.password
    , groups   : true
    }
  }
};