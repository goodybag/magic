var
  db          = require('../db')
, utils       = require('../lib/utils')
, logger      = require('../lib/logger')('tapin-auth')
, errors      = require('../lib/errors')
, magic       = require('../lib/magic')
, Transaction = require('pg-transaction')
, ok = require('okay')

, users       = db.tables.users
, consumers   = db.tables.consumers
, managers    = db.tables.managers
, cashiers    = db.tables.cashiers
, groups      = db.tables.groups
, usersGroups = db.tables.usersGroups
;

module.exports = function(req, res, next){
  // pull out the tapin authorization
  var TAGS = ['middleware-tapin-auth', req.uuid];
  var authMatch = /^Tapin (.*)$/.exec(req.header('authorization'));
  if (!authMatch) return next();
  var cardId = authMatch[1];

  // validate the id
  if (/^[\d]{6,7}-[\w]{3}$/i.test(cardId) == false)
    return res.error(errors.auth.INVALID_CARD_ID);

  // Determines whether we should put "isFirstTapin" on meta object
  var isFirstTapin = false;

  // get current session
  var tapinStationUser = req.session.user;
  if (!tapinStationUser) return next();
  if (tapinStationUser.groups && tapinStationUser.groups.indexOf('tapin-station') === -1) return next();

  // override the response functions
  // - to restore the tapin user after the response is sent
  // - to only send noContent if we're not sending back meta data
  var origjsonFn = res.json, origendFn = res.end;
  res.json = function(output) {
    if (isFirstTapin){
      if (!output.meta) output.meta = {};
      output.meta.isFirstTapin = true;
      output.meta.userId = req.session.user.id;
    }
    req.session.user = tapinStationUser;
    origjsonFn.apply(res, arguments);
  };
  res.end = function(){
    req.session.user = tapinStationUser;
    origendFn.apply(res, arguments);
  };
  res.noContent = function() {
    if (isFirstTapin)
      this.json({});
    else
      this.status(204).end();
  };

  var stage = {
    start: function() {
      stage.lookupUser();
    }

  , lookupUser: function() {
      var query = [
        'SELECT users.id, users.email, users."singlyId", users."singlyAccessToken",',
            'array_agg(groups.name) as groups',
          'FROM users',
            'LEFT JOIN "usersGroups" ON "usersGroups"."userId" = users.id',
            'LEFT JOIN groups ON "usersGroups"."groupId" = groups.id',
          'WHERE users."cardId" = $1',
          'GROUP BY users.id'
      ].join(' ');

      db.query(query, [cardId], function(error, rows, result){
        if (error) return stage.dbError(error);
        var user = result.rows[0];
        if (!user) stage.createUser();
        else       stage.insertTapin(user);
      });
    }

  , createUser: function() {
      // Flag response to send meta.isFirstTapin = true;
      isFirstTapin = true;

      db.procedures.setLogTags(TAGS);
      db.procedures.registerUser('consumer', { cardId:cardId }, function(error, result) {
        if (error) return stage.dbError(result); // registerUser gives error details in result

        var user = result;
        if (!user) return stage.dbError('Unable to create new user');
        return stage.insertTapin(user);
      });
    }

  , insertTapin: function(user) {
      //fetch tapinStation row
      var q = 'SELECT * from "tapinStations" WHERE "tapinStations".id = $1';
      var q = db.tables.tapinStations.where(tapinStations.id.equals(tapinStationUser.id));
      db.query(q, ok(stage.dbError, function(rows) {
        if(rows.length < 1) {
          logger.error('auth failure - tapin station not found', {user: user, tapinStationUser: tapinStationUser});
          return res.error(errors.auth.NOT_ALLOWED, 'You must be logged in as a tapin station to authorize by card-id');
        }
        var tapinStation = rows[0];

        //now we have the tapinStation, set some request variables we can use later
        req.data('locationId', tapinStation.locationId);
        req.data('businessId', tapinStation.businessId);
        req.data('tapinStationId', tapinStation.id);

        var insertQuery = 'INSERT INTO tapins ("userId", "tapinStationId", "cardId", "dateTime") VALUES ($1, $2, $3, now()) RETURNING id'
        var insertValues = [user.id, tapinStationUser.id, cardId];
        db.query(insertQuery, insertValues, ok(stage.dbError, function(rows) {
          var event = {
            userId: user.id,
            tapinId: rows[0].id,
            tapinStationId: tapinStation.id,
            locationId: tapinStation.locationId
          }
          magic.emit('consumers.tapin', event);
          stage.end(user);
        }));
      }));
    }
  , dbError: function(error){
      logger.error('database error', error);
      res.error(errors.internal.DB_FAILURE, error);
    }

  , end: function(user) {
      req.session.user = user;
      next();
    }
  };

  stage.start();
};
