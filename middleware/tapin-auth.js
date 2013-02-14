var
  db      = require('../db')
, utils   = require('../lib/utils')
, logger  = require('../lib/logger')
, errors  = require('../lib/errors')
, magic   = require('../lib/magic')

, users       = db.tables.users
, consumers   = db.tables.consumers
, managers    = db.tables.managers
, cashiers    = db.tables.cashiers
, groups      = db.tables.groups
, usersGroups = db.tables.usersGroups
;

module.exports = function(req, res, next){

  // pull out the tapin authorization
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
  if (tapinStationUser.groups.indexOf('tapin-station') === -1) return next();

  // override the res.json to restore the tapin user after the response is sent
  var origjsonFn = res.json, origendFn = res.end;
  res.json = function(output) {
    if (isFirstTapin){
      if (!output.meta) output.meta = {};
      output.meta.isFirstTapin = true;

      if (req.session.user.groupIds && req.session.user.groupIds.consumer)
        output.meta.consumerId = req.session.user.groupIds.consumer;
    }

    req.session.user = tapinStationUser;


    origjsonFn.apply(res, arguments);
  };

  res.end = function(){
    req.session.user = tapinStationUser;

    origendFn.apply(res, arguments);
  };

  var tx, client;
  var stage = {
    start: function() {
      db.getClient(function(error, client_){
        if (error) return stage.dbError(error);
        client = client_;
        tx = new Transaction(client);
        tx.begin(stage.lookupUser);
      });
    }

  , lookupUser: function() {
      var query = [
        'SELECT users.id, users.email, users."singlyId", users."singlyAccessToken",',
            'consumers.id as "consumerId",',
            'array_agg(groups.name) as groups',
          'FROM users',
            'LEFT JOIN "usersGroups" ON "usersGroups"."userId" = users.id',
            'LEFT JOIN groups ON "usersGroups"."groupId" = groups.id',
            'LEFT JOIN consumers ON consumers."userId" = users.id',
            'LEFT JOIN managers ON managers."userId" = users.id',
            'LEFT JOIN cashiers ON cashiers."userId" = users.id',
          'WHERE',
            'cashiers."cardId" = $1',
            'OR managers."cardId" = $1',
            'OR consumers."cardId" = $1',
          'GROUP BY users.id, consumers.id'
      ].join(' ');
      client.query(query, [cardId], function(error, result){
        if (error) return stage.dbError(error);
        var user = result.rows[0];
        if (!user) stage.createUser();
        else       stage.insertTapin(user);
      });
    }

  , createUser: function() {
      // Flag response to send meta.isFirstTapin = true;
      isFirstTapin = true;

      var query = [
        'WITH',
          '"user" AS',
            '(INSERT INTO users (email, password) VALUES (null, null) RETURNING id),',
          '"userGroup" AS',
            '(INSERT INTO "usersGroups" ("userId", "groupId")',
              'SELECT "user".id, groups.id FROM groups, "user" WHERE groups.name = \'consumer\' RETURNING id),',
          '"consumer" AS',
            '(INSERT INTO consumers ("userId", "cardId")',
              'SELECT "user".id, $1 FROM "user" RETURNING id)', // $1=cardId
        'SELECT "user".id as id, "consumer".id as "consumerId" FROM "user", "consumer"'
      ].join(' ');
      client.query(query, [cardId], function(error, result) {
        if (error) return stage.dbError(error);

        var user = result.rows[0];
        if (!user) return stage.dbError('Unable to create new user');
        user.groups = ['consumer'];
        return stage.insertTapin(user);
      });
    }

  , insertTapin: function(user) {
      var query = [
        'INSERT INTO tapins ("userId", "tapinStationId", "cardId", "dateTime")',
          'SELECT $1, "tapinStations".id, $2, now() FROM "tapinStations"',
            'WHERE "tapinStations"."userId" = $3',
          'RETURNING id'
      ].join(' ');
      client.query(query, [user.id, cardId, tapinStationUser.id], function(error, result) {
        if (error) return stage.dbError(error);
        if (result.rowCount === 0) return res.error(errors.auth.NOT_ALLOWED, 'You must be logged in as a tapin station to authorize by card-id');
        magic.emit('consumers.tapin', user, result.rows[0].id);
        stage.insertVisit(user, result.rows[0].id);
      });
    }

  , insertVisit: function(user, tapinId) {
      if (!user.consumerId) return stage.end(user);

      // only inserts if no visit occured in the last 3 hours
      var query = [
        'INSERT INTO visits ("tapinId", "businessId", "locationId", "tapinStationId", "consumerId", "isFirstVisit", "dateTime")',
          'WITH "lastVisit" AS (',
            'SELECT "dateTime" FROM visits',
              'WHERE visits."consumerId" = $2',
              'ORDER BY visits.id DESC',
            ')',
          'SELECT $1, "businessId", "locationId", id, $2, ("lastVisit"."dateTime" IS NULL), now() FROM "tapinStations"',
            'LEFT JOIN "lastVisit" ON true',
            'WHERE "userId" = $3',
            'AND (',
              '"lastVisit"."dateTime" <= now() - \'3 hours\'::interval',
              'OR "lastVisit"."dateTime" IS NULL',
            ')',
          'RETURNING id, "businessId", "locationId", "isFirstVisit"'
      ].join(' ');
      client.query(query, [tapinId, user.consumerId, tapinStationUser.id], function(error, result) {
        if (error) return stage.dbError(error);

        // No visit
        if (result.rows.length === 0) return stage.end(user);

        var visit = result.rows[0];
        magic.emit('consumers.visit', user.consumerId, visit.id, visit.businessId, visit.locationId, visit.isFirstVisit);
        stage.end(user);
      });
    }

  , dbError: function(error){
      tx.abort();
      res.error(errors.internal.DB_FAILURE, error);
    }

  , end: function(user) {
      tx.commit(function() {;
        req.session.user = user;
        next();
      });
    }
  };

  stage.start();
};