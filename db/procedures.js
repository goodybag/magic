var db = require('./index');
var sql = require('../lib/sql');
var errors = require('../lib/errors');
var utils = require('../lib/utils');
var templates = require('../templates');
var config = require('../config');
var Transaction = require('pg-transaction');

var currentLogTags = null;
module.exports.setLogTags = function(tags) {
  currentLogTags = tags;
};
var consumeLogTags = function() {
  var tags = currentLogTags;
  currentLogTags = null;
  return tags;
};

/**
 * Consumer punch logic
 *
 * @param  object   client
 * @param  object   tx            Transaction
 * @param  int      userId
 * @param  int      businessId
 * @param  int      deltaPunches
 * @param  function cb            Called with (error, hasEarnedReward, numRewards, hasEarnedElite, dateEliteEarned)
 * @return undefined
 */
module.exports.updateUserLoyaltyStats = function(client, tx, userId, businessId, deltaPunches, cb) {

  // run stats upsert
  db.upsert(client,
    ['UPDATE "userLoyaltyStats"',
      'SET',
        '"numPunches"   = "numPunches"   + $3,',
        '"totalPunches" = "totalPunches" + $3',
      'WHERE "userId"=$1 AND "businessId"=$2 RETURNING id, "numPunches", "totalPunches", "isElite", "numRewards"'
    ].join(' '),
    [userId, businessId, deltaPunches],
    ['INSERT INTO "userLoyaltyStats"',
      '("userId", "businessId", "numPunches", "totalPunches", "numRewards", "visitCount", "lastVisit", "isElite")',
      'SELECT $1, $2, $3, $3, 0, 0, now(), false WHERE NOT EXISTS',
        '(SELECT 1 FROM "userLoyaltyStats" WHERE "userId"=$1 AND "businessId"=$2) RETURNING id, "numPunches", "totalPunches", "isElite", "numRewards"'
    ].join(' '),
    [userId, businessId, deltaPunches],
    tx, // provide a transaction
    function(error, result) {
      if (error) return cb(error);
      var uls = result.rows[0];

      // Look up the business loyalty settings
      tx.query('SELECT * from "businessLoyaltySettings" where "businessId" = $1', [businessId], function(error, result) {
        if (error) return cb(error);
        var bls = result.rows[0];
        if (!bls) {
          // not set up yet, use a dummy structure
          bls = {
            punchesRequiredToBecomeElite: 10000000,
            elitePunchesRequired:         10000000,
            regularPunchesRequired:       10000000
          };
        }

        var query = sql.query([
          'UPDATE "userLoyaltyStats" SET {updates}',
            'WHERE "userId"=$userId AND "businessId"=$businessId',
            'RETURNING "numRewards", "dateBecameElite"'
        ]);
        query.updates = sql.fields();
        query.$('userId', userId);
        query.$('businessId', businessId);

        var hasBecomeElite = (uls.totalPunches >= bls.punchesRequiredToBecomeElite && !uls.isElite);
        if (hasBecomeElite) {
          query.updates.add('"isElite" = true');
          query.updates.add('"dateBecameElite"  = now()');
        }

        var punchesRequired = (uls.isElite) ? bls.elitePunchesRequired : bls.regularPunchesRequired;
        var hasEarnedReward = (uls.numPunches >= punchesRequired);
        var rewardsGained = 0;
        if (hasEarnedReward) {
          rewardsGained = Math.floor(uls.numPunches / punchesRequired); // this accounts for the possibility that they punched more than the # required
          query.updates.add('"numPunches" = "numPunches" - $punchesRequired');
          query.updates.add('"numRewards" = "numRewards" + $rewardsGained');
          query.$('punchesRequired', punchesRequired * rewardsGained);
          query.$('rewardsGained', rewardsGained);
        }

        if (!hasEarnedReward && !hasBecomeElite)
          return cb(null, false, uls.numRewards, false, null);

        // Update the users loyalty stat with elite
        tx.query(query.toString(), query.$values, function(error, result) {
          if (error) return cb(error);
          cb(null, hasEarnedReward, result.rows[0].numRewards, hasBecomeElite, result.rows[0].dateBecameElite);
        });
      });
    }
  );
};

/**
 * Consumer punch logic - update by loyaltyStat Id
 *
 * @param  object   client
 * @param  object   tx            Transaction
 * @param  int      userId
 * @param  int      businessId
 * @param  int      deltaPunches
 * @param  function cb            Called with (error, hasEarnedReward, numRewards, hasEarnedElite, dateEliteEarned)
 * @return undefined
 */
module.exports.updateUserLoyaltyStatsById = function(client, tx, statId, deltaPunches, cb) {

  var query = [
    'UPDATE "userLoyaltyStats"',
    'SET',
      '"numPunches"   = "numPunches"   + $2,',
      '"totalPunches" = "totalPunches" + $2',
    'WHERE id=$1',
    'RETURNING id, "userId", "businessId", "numPunches", "totalPunches", "isElite", "numRewards"'
    ].join(' ');

  // run stats upsert
  tx.query(query, [statId, deltaPunches], function(error, result) {
      if (error) return cb(error);
      var uls = result.rows[0];

      // Look up the business loyalty settings
      tx.query('SELECT * from "businessLoyaltySettings" where "businessId" = $1', [uls.businessId], function(error, result) {
        if (error) return cb(error);
        var bls = result.rows[0];
          if (!bls) {
            // not set up yet, use a dummy structure
            bls = {
              punchesRequiredToBecomeElite: 10000000,
              elitePunchesRequired:         10000000,
              regularPunchesRequired:       10000000
            };
          }

        var query = sql.query([
          'UPDATE "userLoyaltyStats" SET {updates}',
            'WHERE "userId"=$userId AND "businessId"=$businessId',
            'RETURNING "numRewards", "dateBecameElite"'
        ]);
        query.updates = sql.fields();
        query.$('userId', uls.userId);
        query.$('businessId', uls.businessId);

        var hasBecomeElite = (uls.totalPunches >= bls.punchesRequiredToBecomeElite && !uls.isElite);
        if (hasBecomeElite) {
          query.updates.add('"isElite" = true');
          query.updates.add('"dateBecameElite"  = now()');
        }

        var punchesRequired = (uls.isElite) ? bls.elitePunchesRequired : bls.regularPunchesRequired;
        var hasEarnedReward = (uls.numPunches >= punchesRequired);
        var rewardsGained = 0;
        if (hasEarnedReward) {
          rewardsGained = Math.floor(uls.numPunches / punchesRequired); // this accounts for the possibility that they punched more than the # required
          query.updates.add('"numPunches" = "numPunches" - $punchesRequired');
          query.updates.add('"numRewards" = "numRewards" + $rewardsGained');
          query.$('punchesRequired', punchesRequired * rewardsGained);
          query.$('rewardsGained', rewardsGained);
        }

        if (!hasEarnedReward && !hasBecomeElite)
          return cb(null, false, uls.numRewards, false, null);

        // Update the users loyalty stat with elite
        tx.query(query.toString(), query.$values, function(error, result) {
          if (error) return cb(error);
          cb(null, hasEarnedReward, result.rows[0].numRewards, hasBecomeElite, result.rows[0].dateBecameElite);
        });
      });
    }
  );
};

module.exports.ensureNotTaken = function(inputs, id, callback, extension){
  var TAGS = consumeLogTags() || ['ensure-not-taken'];
  if (typeof id === "function"){
    extension = callback;
    callback = id;
    id = null;
  }

  extension = extension || 'consumers';

  var query = sql.query('SELECT {subqueries}');
  query.subqueries = sql.fields();

  if (inputs.email) {
    query.subqueries.add('(SELECT id FROM users WHERE email = $email LIMIT 1) AS email');
    query.$('email', inputs.email);
  }

  if (inputs.singlyId) {
    query.subqueries.add('(SELECT id FROM users WHERE "singlyId" = $singlyId LIMIT 1) AS "singlyId"');
    query.$('singlyId', inputs.singlyId);
  }

  if (inputs.singlyAccessToken) {
    query.subqueries.add('(SELECT id FROM users WHERE "singlyAccessToken" = $singlyAccessToken LIMIT 1) AS "singlyAccessToken"');
    query.$('singlyAccessToken', inputs.singlyAccessToken);
  }

  if (inputs.cardId) {
    query.subqueries.add('(SELECT id FROM users WHERE "cardId" = $cardId LIMIT 1) AS "cardId"');
    query.$('cardId', inputs.cardId);
  }

  if (inputs.screenName) {
    query.subqueries.add('(SELECT id FROM "'+extension+'" WHERE "screenName" = $screenName LIMIT 1) AS "screenName"');
    query.$('screenName', inputs.screenName);
  }

  if (query.subqueries.fields.length === 0) return callback();

  db.getClient(TAGS, function(error, client){
    if (error) return callback(errors.internal.DB_FAILURE, error);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return callback(errors.internal.DB_FAILURE, error);
      if (result.rows.length > 0){
        result = result.rows[0];

        if (result.email && inputs.email && result.email != id)
          return callback(errors.registration.EMAIL_REGISTERED);
        if (result.screenName && inputs.screenName && result.screenName != id)
          return callback(errors.registration.SCREENNAME_TAKEN);
        if (result.cardId && inputs.cardId && result.cardId != id)
          return callback(errors.registration.CARD_ID_TAKEN);
        if (result.singlyId && inputs.singlyId && result.singlyId != id)
          return callback(errors.registration.SINGLY_ID_TAKEN);
        if (result.singlyAccessToken && inputs.singlyAccessToken && result.singlyAccessToken != id)
          return callback(errors.registration.SINGLY_ACCESS_TOKEN_TAKEN);
      }

      return callback();
    });
  });
};

module.exports.registerUser = function(group, inputs, options, callback){
  if (!callback && typeof options == 'function'){
    callback = options;
    options = {};
  }
  options = options || {};

  var TAGS = consumeLogTags() || ['register-user'];
  db.getClient(TAGS, function(error, client){
    if (error) return callback(errors.internal.DB_FAILURE, error);

    var extension = (group == 'tapin-station') ? 'tapinStations' : (group+'s');

    module.exports.ensureNotTaken(inputs, function(error, result){
      if (error) return callback(error, result);

      var encrypt = (!options.dontEncrypt) ? utils.encryptPassword : function(p, s, cb) { cb(null, p, s); };
      encrypt(inputs.password, inputs.passwordSalt, function(err, encryptedPassword, passwordSalt) {

        var query = sql.query([
          'WITH',
            '"user" AS',
              '(INSERT INTO users (email, password, "passwordSalt", "singlyId", "singlyAccessToken", "cardId")',
                'SELECT $email, $password, $salt, $singlyId, $singlyAccessToken, $cardId RETURNING *),',
            '"userGroup" AS',
              '(INSERT INTO "usersGroups" ("userId", "groupId")',
                'SELECT "user".id, groups.id FROM groups, "user" WHERE groups.name = $group RETURNING id),',
            '{extension}',
          'SELECT "user".id as "userId" FROM "user"'
        ]);
        query.$('email', inputs.email);
        query.$('password', encryptedPassword);
        query.$('salt', passwordSalt);
        query.$('singlyId', inputs.singlyId);
        query.$('singlyAccessToken', inputs.singlyAccessToken);
        query.$('cardId', inputs.cardId || '');

        switch (group) {
          case 'consumer':
            query.extension = [
            '"consumer" AS',
              '(INSERT INTO "consumers" ("id", "firstName", "lastName", "screenName", "avatarUrl")',
                'SELECT "user".id, $firstName, $lastName, $screenName, $avatarUrl FROM "user")'
            ].join(' ');
            query.$('group', 'consumer');
            query.$('firstName', inputs.firstName);
            query.$('lastName', inputs.lastName);
            query.$('screenName', inputs.screenName);
            query.$('avatarUrl', inputs.avatarUrl);
            break;
          case 'cashier':
            query.extension = [
            '"cashier" AS',
              '(INSERT INTO "cashiers" ("id", "businessId", "locationId")',
                'SELECT "user".id, $businessId, $locationId FROM "user")'
            ].join(' ');
            query.$('group', 'cashier');
            query.$('businessId', inputs.businessId);
            query.$('locationId', inputs.locationId);
            break;
          case 'manager':
            query.extension = [
            '"manager" AS',
              '(INSERT INTO "managers" ("id", "businessId", "locationId")',
                'SELECT "user".id, $businessId, $locationId FROM "user")'
            ].join(' ');
            query.$('group', 'manager');
            query.$('businessId', inputs.businessId);
            query.$('locationId', inputs.locationId);
            break;
          case 'tapin-station':
            query.extension = [
            '"station" AS',
              '(INSERT INTO "tapinStations" ("id", "businessId", "locationId", "loyaltyEnabled", "galleryEnabled", "numUnconfirmedPunchesAllowed")',
                'SELECT "user".id, $businessId, $locationId, $loyaltyEnabled, $galleryEnabled, $numUnconfirmedPunchesAllowed FROM "user")'
            ].join(' ');
            query.$('group', 'tapin-station');
            query.$('businessId', inputs.businessId);
            query.$('locationId', inputs.locationId);
            query.$('loyaltyEnabled', !!inputs.loyaltyEnabled);
            query.$('galleryEnabled', !!inputs.galleryEnabled);
            query.$('numUnconfirmedPunchesAllowed', (+inputs.numUnconfirmedPunchesAllowed) || 0);
            break;
          default:
            throw "Invalid group: "+group;
        }

        client.query(query.toString(), query.$values, function(error, result) {
          if (error) return callback(errors.internal.DB_FAILURE, error);

          inputs.userId = result.rows[0].userId;

          // Return session object
          var user = {
            id: inputs.userId
          , email: inputs.email
          , singlyAccessToken: inputs.singlyAccessToken
          , singlyId: inputs.singlyId
          , groups: [group]
          };

          callback(null, user);
        });
      });
    }, extension);
  });
};

module.exports.updateUser = function(group, userId, inputs, callback) {
  var TAGS = consumeLogTags() || ['create-user'];
  if (inputs.password)
    delete inputs.password; // for now, no password updates

  // :DEBUG: this is a temporary fix while the document cascade api is built
  if (typeof inputs.email != 'undefined' && !inputs.email)
    return callback(errors.input.VALIDATION_FAILED, { email:'Can not be set to a blank value.' });

  db.getClient(TAGS, function(error, client){
    if (error) return callback(errors.internal.DB_FAILURE, error);

    var extension = (group == 'tapin-station') ? 'tapinStations' : (group+'s');
    module.exports.ensureNotTaken(inputs, userId, function(error, result){
      if (error) return callback(error, result);

      var tx = new Transaction(client);
      tx.begin(function(error){
        if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        var updateRecord = function(table, callback) {
          var needsUpdate = false, data = {};
          // Determine if we even need to update the record
          for (var i = db.fields[table].plain.length - 1; i >= 0; i--){
            if (db.fields[table].plain[i] in inputs){
              needsUpdate = true;
              data[db.fields[table].plain[i]] = inputs[db.fields[table].plain[i]];
            }
          }
          if (!needsUpdate) return callback();

          var query = sql.query('UPDATE "{table}" SET {updates} WHERE id=$id');
          query.table = table;
          query.updates = sql.fields().addUpdateMap(data, query);
          query.$('id', userId);

          tx.query(query.toString(), query.$values, function(error, result){
            if (error) return callback(errors.internal.DB_FAILURE, error);
            if (result.rowCount === 0)
              return callback(errors.input.NOT_FOUND);
            callback();
          });
        };

        // the magic starts here
        updateRecord('users', function(err, result) {
          if (err) return tx.abort(), callback(err, result);
          updateRecord(extension, function(err, result) {
            if (err) return tx.abort(), callback(err, result);
            tx.commit(callback);
          });
        });
      });
    });
  });
};