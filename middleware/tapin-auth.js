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

  // override the response functions
  // - to restore the tapin user after the response is sent
  // - to only send noContent if we're not sending back meta data
  var origjsonFn = res.json, origendFn = res.end;
  res.json = function(output) {
    if (isFirstTapin){
      if (!output.meta) output.meta = {};
      output.meta.isFirstTapin = true;
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
            'array_agg(groups.name) as groups',
          'FROM users',
            'LEFT JOIN "usersGroups" ON "usersGroups"."userId" = users.id',
            'LEFT JOIN groups ON "usersGroups"."groupId" = groups.id',
          'WHERE users."cardId" = $1',
          'GROUP BY users.id'
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
            '(INSERT INTO users (email, password, "cardId") VALUES (null, null, $1) RETURNING id),',
          '"userGroup" AS',
            '(INSERT INTO "usersGroups" ("userId", "groupId")',
              'SELECT "user".id, groups.id FROM groups, "user" WHERE groups.name = \'consumer\' RETURNING id),',
          '"consumer" AS',
            '(INSERT INTO consumers ("userId") SELECT "user".id FROM "user")',
        'SELECT "user".id as id FROM "user"'
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
          'SELECT $1, "tapinStations"."userId", $2, now() FROM "tapinStations"',
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
      if (user.groups.indexOf('consumer') === -1) return stage.end(user);

      // only inserts if no visit occured in the last 3 hours
      var query = [
        'INSERT INTO visits ("tapinId", "businessId", "locationId", "tapinStationId", "userId", "isFirstVisit", "dateTime")',
          'WITH "lastVisit" AS (',
            'SELECT "dateTime" FROM visits',
              'WHERE visits."userId" = $2',
              'ORDER BY visits.id DESC',
            ')',
          'SELECT $1, "businessId", "locationId", $3, $2, ("lastVisit"."dateTime" IS NULL), now() FROM "tapinStations"',
            'LEFT JOIN "lastVisit" ON true',
            'WHERE "userId" = $3',
            'AND (',
              '"lastVisit"."dateTime" <= now() - \'3 hours\'::interval',
              'OR "lastVisit"."dateTime" IS NULL',
            ')',
          'RETURNING id, "businessId", "locationId", "isFirstVisit"'
      ].join(' ');
      client.query(query, [tapinId, user.id, tapinStationUser.id], function(error, result) {
        if (error) return stage.dbError(error);

        // No visit
        if (result.rows.length === 0) return stage.end(user);

        var visit = result.rows[0];
        magic.emit('consumers.visit', user.id, visit.id, visit.businessId, visit.locationId, visit.isFirstVisit);
        stage.end(user);
      });
    }

  , dbError: function(error){
      tx.abort();
      res.error(errors.internal.DB_FAILURE, error);
    }

  , end: function(user) {
      tx.commit(function() {
        // First groupIds
        if (!user.groupIds){
          user.groupIds = {};
          for (var i = user.groups.length - 1; i >= 0; i--){
            if (user[user.groups[i] + 'Id'])
              user.groupIds[user.groups[i]] = user[user.groups[i] + 'Id'];
          }
        }
        req.session.user = user;
        next();
      });
    }
  };

  stage.start();
};