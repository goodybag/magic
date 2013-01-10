var db = require('../../db');
var groups = db.tables.groups;

module.exports = {
  "default": {
    id    : groups.id
  , name  : groups.name
  , users : true
  , $postRequires : ['name']
  }
, client: {
    id    : groups.id
  , name  : groups.name
  , users : true
  , $postRequires : ['name']
  }
, sales: {
    id    : groups.id
  , name  : groups.name
  , users : true
  , $postRequires : ['name']
  }
, admin: {
    id    : groups.id
  , name  : groups.name
  , users : true
  , $postRequires : ['name']
  }
};