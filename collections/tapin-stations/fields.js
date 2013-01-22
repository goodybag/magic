var db = require('../../db');
var users = db.tables.users;
var usersGroups = db.tables.usersGroups;
var tapinStations = db.tables.tapinStations;

var $postRequires = [
  'businessId'
, 'locationId'
];

module.exports = {
  "default": {}

, "admin": {
    $postRequires       : $postRequires
  , userId              : users.id
  , email               : users.email
  , password            : users.password
  , tapinStationId      : tapinStations.id
  , businessId          : tapinStations.businessId
  , locationId          : tapinStations.locationId
  , loyaltyEnabled      : tapinStations.loyaltyEnabled
  , galleryEnabled      : tapinStations.galleryEnabled
  }

, "sales": {
    $postRequires       : $postRequires
  , userId              : users.id
  , email               : users.email
  , password            : users.password
  , businessId          : tapinStations.businessId
  , locationId          : tapinStations.locationId
  , loyaltyEnabled      : tapinStations.loyaltyEnabled
  , galleryEnabled      : tapinStations.galleryEnabled
  }

, "owner": {
    $postRequires       : $postRequires
  , userId              : users.id
  , email               : users.email
  , password            : users.password
  , businessId          : tapinStations.businessId
  , locationId          : tapinStations.locationId
  , loyaltyEnabled      : tapinStations.loyaltyEnabled
  , galleryEnabled      : tapinStations.galleryEnabled
  }
};