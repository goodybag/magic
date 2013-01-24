var db = require('../../db');
var userLoyaltyStats = db.tables.userLoyaltyStats;

module.exports = {
  access:{
    "default": {
    }

  , owner: {
      consumerId   : userLoyaltyStats.consumerId
    , businessId   : userLoyaltyStats.businessId
    , numPunches   : userLoyaltyStats.numPunches
    , totalPunches : userLoyaltyStats.totalPunches
    , visitCount   : userLoyaltyStats.visitCount
    , lastVisit    : userLoyaltyStats.lastVisit
    }

  , sales: {
      consumerId   : userLoyaltyStats.consumerId
    , businessId   : userLoyaltyStats.businessId
    , numPunches   : userLoyaltyStats.numPunches
    , totalPunches : userLoyaltyStats.totalPunches
    , visitCount   : userLoyaltyStats.visitCount
    , lastVisit    : userLoyaltyStats.lastVisit
    }

  , admin: {
      consumerId   : userLoyaltyStats.consumerId
    , businessId   : userLoyaltyStats.businessId
    , numPunches   : userLoyaltyStats.numPunches
    , totalPunches : userLoyaltyStats.totalPunches
    , visitCount   : userLoyaltyStats.visitCount
    , lastVisit    : userLoyaltyStats.lastVisit
    }
  },
  mutate:{
    "default": {
    }

  , owner: {
      deltaPunches : true
    , consumerId   : true
    , businessId   : true
    , $postRequires : ['deltaPunches', 'businessId']
    }

  , sales: {
      deltaPunches : true
    , consumerId   : true
    , businessId   : true
    , $postRequires : ['deltaPunches', 'businessId']
    }

  , admin: {
      deltaPunches : true
    , consumerId   : true
    , businessId   : true
    , $postRequires : ['deltaPunches', 'businessId']
    }
  }
};