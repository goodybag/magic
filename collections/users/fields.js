var db = require('../../db');
var users = db.tables.users;

module.exports = {
  "default": {
    id : users.id
  }
, client: {
    id       : users.id
  , email    : users.email
  , password : users.password
  }
, sales: {
    id       : users.id
  , email    : users.email
  , password : users.password
  }
, admin: {
    id       : users.id
  , email    : users.email
  , password : users.password
  }
};