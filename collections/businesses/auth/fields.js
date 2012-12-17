var businesses = require('../schema/definition');

module.exports = {
  "default": [
    businesses.id
  , businesses.name
  , businesses.street1
  , businesses.street2
  , businesses.city
  , businesses.state
  , businesses.zip
  , businesses.isEnabled
  , businesses.cardCode
  ]

, "client": [
    businesses.id
  , businesses.name
  , businesses.street1
  , businesses.street2
  , businesses.city
  , businesses.state
  , businesses.zip
  ]

, "sales": [
    businesses.id
  , businesses.name
  , businesses.street1
  , businesses.street2
  , businesses.city
  , businesses.state
  , businesses.zip
  , businesses.isEnabled
  , businesses.cardCode
  ]

, "admin": [
    businesses.id
  , businesses.name
  , businesses.street1
  , businesses.street2
  , businesses.city
  , businesses.state
  , businesses.zip
  , businesses.isEnabled
  , businesses.cardCode
  ]
};