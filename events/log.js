/**
 * Listeners for all the events that we want to store in the log
 */

var
  db      = require('../db')
, utils   = require('../lib/utils')
, sql     = require('../lib/sql')

, logger  = require('../lib/logger')({ app: 'api', component: 'events' })

, insert = function(type, data, callback){
    var TAGS = ['store-events', type];

    callback = callback || utils.noop;

    db.getClient(['log-event'], function(error, client){
      if (error) return logger.error(TAGS, error);

      var inputs = {
        type: type
      , date: new Date()
      };

      var query = sql.query('insert into events ({fields}) values ({values})');
      query.fields = sql.fields().addObjectKeys(inputs);
      query.values = sql.fields().addObjectValues(inputs, query);

      query.fields.add('"data"');
      query.values.add(sql.hstoreValue(data));

      client.query(query.toString(), query.$values, function(error){
        if (error) return logger.error(TAGS, error);

        callback();
      });
    });
  }
;

module.exports = {
  'consumers.registered':
  function (consumer){
    insert('consumers.registered', { userId: consumer.id });
  }

, 'consumers.becameElite':
  function (userId, businessId, date){
    insert('consumers.becameElite', {
      userId:     userId
    , businessId: businessId
    , date:       date
    });
  }

, 'consumers.visit':
  function (userId, visitId, businessId, locationId, isFirstTime) {
    insert('consumers.visit', { userId: userId, visitId:visitId, businessId:businessId, locationId:locationId, isFirstTime:isFirstTime });
  }

, 'consumers.tapin':
  function (user, tapinStationId) {
    insert('consumers.tapin', { userId:user.id, tapinStationId:tapinStationId });
  }

// , 'consumers.donation':
//   function (consumer, donation){
//     insert('consumers.donation', {
//       consumerId: consumer.id
//     , donationId: donation.id
//     , amount:     donation.amount
//     });
//   }

, 'products.like':
  function (userId, productId){
    insert('products.like', { userId: userId, productId: productId });
  }

, 'products.try':
  function (userId, productId){
    insert('products.try', { userId: userId, productId: productId });
  }

, 'products.want':
  function (userId, productId){
    insert('products.want', { userId: userId, productId: productId });
  }

, 'products.unlike':
  function (userId, productId){
    insert('products.unlike', { userId: userId, productId: productId });
  }

, 'products.untry':
  function (userId, productId){
    insert('products.untry', { userId: userId, productId: productId });
  }

, 'products.unwant':
  function (userId, productId){
    insert('products.unwant', { userId: userId, productId: productId });
  }

, 'loyalty.punch':
  function (deltaPunches, userId, businessId, locationId, employeeId){
    insert('loyalty.punch', {
      deltaPunches: deltaPunches
    , userId:       userId
    , businessId:   businessId
    , locationId:   locationId
    , employeeId:   employeeId
    });
  }

, 'loyalty.redemption':
  function (deltaPunches, userId, businessId, locationId, employeeId){
    insert('loyalty.redemption', {
      deltaPunches: deltaPunches
    , userId:       userId
    , businessId:   businessId
    , locationId:   locationId
    , employeeId:   employeeId
    });
  }

, 'loyalty.redemption':
  function (deltaPunches, userId, businessId, locationId, employeeId){
    insert('loyalty.hasEarnedReward', {
      deltaPunches: deltaPunches
    , userId:       userId
    , businessId:   businessId
    , locationId:   locationId
    , employeeId:   employeeId
    });
  }

, 'tapinstations.heartbeat':
  function (tapinStationId, businessId, locationId) {
    insert('tapinstations.heartbeat', {
      tapinStationId : tapinStationId,
      businessId     : businessId,
      locationId     : locationId
    });
  }

, 'locations.keyTagRequest':
  function (locationId) {
    insert('locations.keyTagRequest', {
      locationId     : locationId
    });
  }
};