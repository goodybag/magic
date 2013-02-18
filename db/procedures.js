
/**
 * Consumer punch logic
 *
 * @param  object   client
 * @param  object   tx            Transaction
 * @param  int      consumerId
 * @param  int      businessId
 * @param  int      deltaPunches
 * @param  function cb            Called with (error, hasEarnedReward, numRewards, hasEarnedElite, dateEliteEarned)
 * @return undefined
 */
module.exports.updateUserLoyaltyStats = function(client, tx, consumerId, businessId, deltaPunches, cb) {

  // run stats upsert
  db.upsert(client,
    ['UPDATE "userLoyaltyStats"',
      'SET',
        '"numPunches"   = "numPunches"   + $3,',
        '"totalPunches" = "totalPunches" + $3',
      'WHERE "consumerId"=$1 AND "businessId"=$2 RETURNING id, "numPunches", "totalPunches", "isElite", "numRewards"'
    ].join(' '),
    [consumerId, businessId, deltaPunches],
    ['INSERT INTO "userLoyaltyStats"',
      '("consumerId", "businessId", "numPunches", "totalPunches", "numRewards", "visitCount", "lastVisit", "isElite")',
      'SELECT $1, $2, $3, $3, 0, 0, now(), false WHERE NOT EXISTS',
        '(SELECT 1 FROM "userLoyaltyStats" WHERE "consumerId"=$1 AND "businessId"=$2) RETURNING id, "numPunches", "totalPunches", "isElite", "numRewards"'
    ].join(' '),
    [consumerId, businessId, deltaPunches],
    tx, // provide a transaction
    function(error, result) {
      if (error) return cb(error);
      var uls = result.rows[0];

      // Look up the business loyalty settings
      tx.query('SELECT * from "businessLoyaltySettings" where "businessId" = $1', [businessId], function(error, result) {
          if (error) return cb(error);
          var bls = result.rows[0];

          var query = sql.query([
            'UPDATE "userLoyaltyStats" SET {updates}',
              'WHERE "consumerId"=$consumerId AND "businessId"=$businessId',
              'RETURNING "numRewards", "dateBecameElite"'
          ]);
          query.updates = sql.fields();
          query.$('consumerId', consumerId);
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
        }
      );
    }
  );
};

/**
 * Consumer punch logic - update by loyaltyStat Id
 *
 * @param  object   client
 * @param  object   tx            Transaction
 * @param  int      consumerId
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
    'RETURNING id, "consumerId", "businessId", "numPunches", "totalPunches", "isElite", "numRewards"'
    ].join(' ');

  // run stats upsert
  tx.query(query, [statId, deltaPunches], function(error, result) {
      if (error) return cb(error);
      var uls = result.rows[0];

      // Look up the business loyalty settings
      tx.query('SELECT * from "businessLoyaltySettings" where "businessId" = $1', [uls.businessId], function(error, result) {
        if (error) return cb(error);
        var bls = result.rows[0];

        var query = sql.query([
          'UPDATE "userLoyaltyStats" SET {updates}',
            'WHERE "consumerId"=$consumerId AND "businessId"=$businessId',
            'RETURNING "numRewards", "dateBecameElite"'
        ]);
        query.updates = sql.fields();
        query.$('consumerId', uls.consumerId);
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

module.exports.ensureNotTaken = function(inputs, callback){
  var query = sql.query('select {fields} from users, consumers');

  query.fields = sql.fields();

  if (inputs.email)
    query.fields.add(
      'bool_or(case when users.email = \''
    + inputs.email
    + '\' then true else false end) as email'
    );

  // If they're doing a user create, they're not intending on updating
  // an existing oauth user
  if (inputs.singlyId)
    query.fields.add(
      'bool_or(case when users."singlyId" = \''
    + inputs.singlyId
    + '\' then true else false end) as "singlyId"'
    );

  if (inputs.singlyAccessToken)
    query.fields.add(
      'bool_or(case when users."singlyAccessToken" = \''
    + inputs.singlyAccessToken
    + '\' then true else false end) as "singlyAccessToken"'
    );

  if (inputs.screenName)
    query.fields.add(
      'bool_or(case when consumers."screenName" = \''
    + inputs.screenName
    + '\' then true else false end) as "screenName"'
    );

  if (inputs.cardId)
    query.fields.add(
      'bool_or(case when consumers."cardId" = \''
    + inputs.cardId
    + '\' then true else false end) as "cardId"'
    );

  if (query.fields.fields.length === 0) return callback();

  db.getClient(function(error, client){
    if (error) return callback(error);

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return callback(error);

      if (result.rows.length > 0){
        result = result.rows[0];

        if (result.email && inputs.email)
          return callback(errors.registration.EMAIL_REGISTERED);
        if (result.screenName && inputs.screenName)
          return callback(errors.registration.SCREENNAME_TAKEN);
        if (result.cardId && inputs.cardId)
          return callback(errors.registration.CARD_ID_TAKEN);
        if (result.singlyId && inputs.singlyId)
          return callback(errors.registration.CARD_ID_TAKEN);
        if (result.singlyAccessToken && inputs.singlyAccessToken)
          return callback(errors.registration.CARD_ID_TAKEN);
      }

      return callback();
    });
  });
};

module.exports.registerConsumer = function(inputs, callback){
  db.getClient('register-consumer', function(error, client){
    if (error) return callback(errors.internal.DB_FAILURE, error);

    module.exports.ensureNotTaken(inputs, function(error){
      if (error) return callback(error);

      var query = sql.query([
        'WITH',
          '"user" AS',
            '(INSERT INTO users ({uidField}, {upassField}) SELECT $uid, $upass RETURNING *),',
          '"userGroup" AS',
            '(INSERT INTO "usersGroups" ("userId", "groupId")',
              'SELECT "user".id, groups.id FROM groups, "user" WHERE groups.name = \'consumer\' RETURNING id),',
          '"consumer" AS',
            '(INSERT INTO "consumers" ("userId", "firstName", "lastName", "cardId", "screenName")',
              'SELECT "user".id, $firstName, $lastName, $cardId, $screenName FROM "user" RETURNING id)',
        'SELECT "user".id as "userId", "consumer".id as "consumerId" FROM "user", "consumer"'
      ]);

      if (inputs.email) {
        query.uidField = 'email';
        query.upassField = 'password';
        query.$('uid', inputs.email);
        query.$('upass', utils.encryptPassword(inputs.password));
      } else {
        query.uidField = '"singlyId"';
        query.upassField = '"singlyAccessToken"';
        query.$('uid', inputs.singlyId);
        query.$('upass', inputs.singlyAccessToken);
      }

      query.$('firstName', inputs.firstName);
      query.$('lastName', inputs.lastName);
      query.$('cardId', inputs.cardId || '');
      query.$('screenName', inputs.screenName);

      client.query(query.toString(), query.$values, function(error, result) {
        if (error) return callback(errors.internal.DB_FAILURE, error);

        inputs.consumerId = result.rows[0].consumerId;
        inputs.userId = result.rows[0].userId;

        // Return session object
        var user = {
          id: inputs.userId
        , email: inputs.email
        , singlyAccessToken: inputs.singlyAccessToken
        , singlyId: inputs.singlyId
        , groups: ['consumers']
        , groupIds: { consumers: inputs.consumerId }
        };

        callback(null, user);

        // Consider putting this in events
        if (inputs.email) {
          var emailHtml = templates.email.complete_registration({
            url:'http://loljk.com',
          });
          utils.sendMail(inputs.email, config.emailFromAddress, 'Welcome to Goodybag!', emailHtml/*, function(err, result) {
            console.log('email cb', err, result);
          }*/);
        }
      });
    });
  });
};