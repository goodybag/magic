var db = require('../../db');
var userRedemptions = db.tables.userRedemptions;

module.exports = {
  access:{
    "default": {}

  , sales: {
      id             : userRedemptions.id
    , businessId     : userRedemptions.businessId
    , consumerId     : userRedemptions.consumerId
    , cashierUserId  : userRedemptions.cashierUserId
    , locationId     : userRedemptions.locationId
    , tapinStationId : userRedemptions.tapinStationId
    , dateTime       : userRedemptions.dateTime
    }

  , admin: {
      id             : userRedemptions.id
    , businessId     : userRedemptions.businessId
    , consumerId     : userRedemptions.consumerId
    , cashierUserId  : userRedemptions.cashierUserId
    , locationId     : userRedemptions.locationId
    , tapinStationId : userRedemptions.tapinStationId
    , dateTime       : userRedemptions.dateTime
    }
  },
  create:{
    "default": {}

  , cashier: {
      consumerId     : userRedemptions.consumerId
    , tapinStationId : userRedemptions.tapinStationId
    , email          : true
    , $postRequires : ['consumerId', 'tapinStationId']
    }
  }
};