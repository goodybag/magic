var db = require('../../db');

var write = ['products', 'products.id', 'products.order'].concat(db.fields.menuSections.plain)

module.exports = {
  world: {
    // Use all db fields, but add reference to products
    read: ['products:products'].concat(db.fields.menuSections.plain)
  , create: []
  , update: []
  }

, sales: {
    read:   true
  , create: write
  , update: write
  }

, admin: {
    read:   true
  , create: write
  , update: write
  }
};