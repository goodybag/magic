var db = require('../../db');
var userLoyaltyStats = db.tables.userLoyaltyStats;

module.exports = {
  access:{
    "default": {
    }

  , owner: {
      consumerId   : userLoyaltyStats.consumerId
    , numPunches   : userLoyaltyStats.numPunches
    , totalPunches : userLoyaltyStats.totalPunches
    , visitCount   : userLoyaltyStats.visitCount
    , lastVisit    : userLoyaltyStats.lastVisit
    }

  , sales: {
      consumerId   : userLoyaltyStats.consumerId
    , numPunches   : userLoyaltyStats.numPunches
    , totalPunches : userLoyaltyStats.totalPunches
    , visitCount   : userLoyaltyStats.visitCount
    , lastVisit    : userLoyaltyStats.lastVisit
    }

  , admin: {
      consumerId   : userLoyaltyStats.consumerId
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
    }

  , sales: {
      deltaPunches : true
    , consumerId   : true
    }

  , admin: {
      deltaPunches : true
    , consumerId   : true
    }
  }
};