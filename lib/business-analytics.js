//runs simple analytics report to pull
//info for bizpanel simple dashboard

var async = require('async');
var ok = require('okay');
var db = require('../db');
var _ = require('lodash');
var users = db.tables.users;
var consumers = db.tables.consumers;
var businesses = db.tables.businesses;
var locations = db.tables.locations;
var tapins = db.tables.tapins;
var tapinStations = db.tables.tapinStations;
var products = db.tables.products;
var productLikes = db.tables.productLikes;
var activity = db.tables.activity;

var exec = function(query, callback) {
  var q = query.toQuery();
  db.query(q.text, q.values, function(error, rows, result) {
    if(error) return callback(error);
    callback(null, result.rows[0]);
  });
};

var getUsersQuery = function() {
  //get total users
  var join = users
  .join(consumers).on(users.id.equals(consumers.id))
  .join(tapins).on(tapins.userId.equals(users.id))
  .join(tapinStations).on(tapins.tapinStationId.equals(tapinStations.id))
  .join(locations).on(tapinStations.locationId.equals(locations.id))
  .join(businesses).on(locations.businessId.equals(businesses.id))

  var query = users
  .select(users.id.count().distinct().as('totalUsers'))
  .from(join)

  return query;
}

//business specific measures
var getTotalUsersForBusiness = function(businessId, callback) {
  var query = getUsersQuery();
  query = query.where(businesses.id.equals(businessId))
  exec(query, callback);
};

//total likes for a business are comprised of all likes for all products
var getTotalLikesForBusiness = function(businessId, callback) {
  var join = products
  .join(businesses).on(products.businessId.equals(businesses.id))
  .join(productLikes).on(productLikes.productId.equals(products.id))

  var query = products
  .select(products.id.count().as('totalLikes'))
  .from(join)
  .where(businesses.id.equals(businessId));

  exec(query, callback);
};

var getTotalPunchesForBusiness = function(businessId, callback) {
  var query = activity
    .select(activity.star().count().as('totalPunches'))
    .where(activity.type.equals('punch'))
    .and(activity.businessId.equals(businessId))
  var q = query.toQuery();
  return db.query(q.text, q.values, ok(callback, function(rows, results) {
    callback(null, results.rows[0]);
  }));
};

var getTotalLikesForLocation = function(locationId, callback) {
  var query = ['SELECT COUNT(*) as "totalLikes"',
    'FROM events',
    'WHERE (events.data::hstore->\'locationId\' = $1::text)',
    'AND events.type = $2'
  ].join(' ');
  return db.query(query, [locationId, 'products.like'], ok(callback, function(rows, results) {
    callback(null, results.rows[0]);
  }));
};

var getTotalUsersForLocation = function(locationId, callback) {
  var query = getUsersQuery();
  query = query.where(locations.id.equals(locationId))
  exec(query, callback);
};

var getTotalPunchesForLocation = function(locationId, callback) {
  var query = activity
  .select(activity.star().count().as('totalPunches'))
  .where(activity.type.equals('punch'))
  .and(activity.locationId.equals(locationId))
  var q = query.toQuery();
  return db.query(q.text, q.values, ok(callback, function(rows, results) {
    callback(null, results.rows[0]);
  }));
};

var runActions = function(actions, callback) {
  var done = function(results) {
    var output = {};
    //turn array of objects into a single object
    _.each(results, _.extend.bind(_, output));
    callback(null, output);
  };
  async.parallel(actions, ok(callback, done));
};

var forBusiness = function(businessId, callback) {
  var actions = [
    getTotalUsersForBusiness.bind(this, businessId),
    getTotalLikesForBusiness.bind(this, businessId),
    getTotalPunchesForBusiness.bind(this, businessId)
  ];
  runActions(actions, callback);
};

var forLocation = function(locationId, callback) {
  var actions = [
    getTotalUsersForLocation.bind(this, locationId),
    getTotalLikesForLocation.bind(this, locationId),
    getTotalPunchesForLocation.bind(this, locationId)
  ];
  runActions(actions, callback);
};

module.exports = {
  forBusiness: forBusiness,
  forLocation: forLocation
};
