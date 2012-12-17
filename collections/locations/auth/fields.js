var locations = require('../schema/definition');

module.exports = {
  "default": [
    locations.id
  , locations.businessId
  , locations.name
  , locations.street1
  , locations.street2
  , locations.city
  , locations.state
  , locations.zip
  , locations.country
  , locations.phone
  , locations.fax
  , locations.lat
  , locations.lon
  , locations.isEnabled
  ]

, "client": [
    locations.id
  , locations.businessId
  , locations.name
  , locations.street1
  , locations.street2
  , locations.city
  , locations.state
  , locations.zip
  , locations.country
  , locations.phone
  , locations.fax
  , locations.lat
  , locations.lon
  , locations.isEnabled
  ]

, "sales": [
    locations.id
  , locations.businessId
  , locations.name
  , locations.street1
  , locations.street2
  , locations.city
  , locations.state
  , locations.zip
  , locations.country
  , locations.phone
  , locations.fax
  , locations.lat
  , locations.lon
  ]

, "admin": [
    locations.id
  , locations.businessId
  , locations.name
  , locations.street1
  , locations.street2
  , locations.city
  , locations.state
  , locations.zip
  , locations.country
  , locations.phone
  , locations.fax
  , locations.lat
  , locations.lon
  , locations.isEnabled
  ]
};