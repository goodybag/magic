var db = require('../../db');

module.exports = {
  world: {
    // Use all db fields, but add reference to products
    read: ['products:products'].concat(db.fields.menuSections.plain)
  , create: []
  , update: []
  }

, sales: {
    read:   true
  , create: true
  , update: true
  }

, admin: {
    read:   true
  , create: true
  , update: true
  }
};