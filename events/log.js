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

    var inputs = {
      type: type
    , date: new Date()
    };

    var query = sql.query('insert into events ({fields}) values ({values})');
    query.fields = sql.fields().addObjectKeys(inputs);
    query.values = sql.fields().addObjectValues(inputs, query);

    query.fields.add('"data"');
    query.values.add(sql.hstoreValue(data));

    db.query(query, function(error){
      if (error) return logger.error(TAGS, error);

      callback();
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
  function (event) {
    insert('consumers.tapin', event);
  }

, 'products.like':
  function (event){
    insert('products.like', event);
  }

, 'products.try':
  function (event){
    insert('products.try', event);
  }

, 'products.want':
  function (event){
    insert('products.want', event);
  }

, 'products.unlike':
  function (event){
    insert('products.unlike', event);
  }

, 'products.untry':
  function (event){
    insert('products.untry', event);
  }

, 'products.unwant':
  function (event){
    insert('products.unwant', event);
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

, 'locations.keyTagRequest':
  function (locationId) {
    insert('locations.keyTagRequest', {
      locationId     : locationId
    });
  }

, 'users.accountMerge':
  function (data) {
    insert('users.accountMerge', data);
  }
};
