var
  db      = require('../db')
, utils   = require('../lib/utils')
, logger  = require('../lib/logger')
, errors  = require('../lib/errors')

, users       = db.tables.users
, consumers   = db.tables.consumers
, managers    = db.tables.managers
, cashiers    = db.tables.cashiers
, groups      = db.tables.groups
, usersGroups = db.tables.usersGroups
;

module.exports = function(req, res, next){
  if (!req.header('tapin-auth')) return next();

  if (!req.session || !req.session.user) return next();

  // only certain groups can respond to this request type
  if (req.session.user.groups.indexOf('tapin-station') === -1) return next();
  var
    // Keep track of the current user
    currentUser = req.session.user
    // We're going to override this function - keep track of what it was
  , currentEnd = res.end

  , cardId = req.header('tapin-auth')

  , tx

    // Fulfilled in start
  , client

  , stage = {
      start: function(){
        db.getClient(function(error, client_){
          if (error) return stage.dbError(error);

          client = client_;
          tx = new Transaction(client);

          tx.being(function(){
            stage.lookUpUser();
          });
        });
      }

      // Look up the user based on cardId and set them to session
    , lookUpUser: function(){
        // Joins on consumers, managers, cashiers because
        // those are the groups we support for tapin-auths
        // The cardId could belong to any one of those extension tables
        var query = users.select(
          users.id
        , users.email
        , users.singlyId
        , users.singlyAccessToken
        , groups.name
        ).from(
          users.join(consumers).on(
            consumers.userId.equals(users.id)
          ).join(managers).on(
            managers.userId.equals(users.id)
          ).join(cashiers).on(
            cashiers.userId.equals(users.id)
          ).join(usersGroups).on(
            usersGroups.userId.equals(users.id)
          ).join(groups).on(
            groups.id.equals(usersGroups.groupId)
          )
        ).where(
          consumers.cardId.equals(cardId).or(
            managers.cardId.equals(cardId).or(
              cashiers.cardId.equals(cardId)
            )
          )
        ).toQuery();

        client.query(query, function(error, result){
          if (error) return stage.dbError(error);

          if (result.rows.length === 0) return stage.createNewConsumer();

          var user = rows[0];

          // Put the groups in an array on the user
          user.groups = [];
          for (var i = rows.length - 1; i >= 0; i--){
            if (rows[i].name) user.groups.push(rows[i].name);
          }

          // Delete reference to the initial group name
          delete user.name;

          return stage.insertTapin(user);
        });
      }

    , insertTapin: function(user){

      }

    , determineIfVisit: function(user, tapin){

      }

    , loadUserIntoSession: function(user){
        req.session.user = user;
        stage.end();
      }

    , createNewConsumer: function(){
        // Incomplete for now
        res.error(errors.auth.INVALID_CARD_ID);
      }

    , dbError: function(error){
        tx.abort();
        res.error(errors.internal.DB_FAILURE);
      }

    , end: function(){
        next();
      }
    };
  ;

  // Override the res.end function so we can restore the
  // user in session after the request has been performed
  res.end = function(){
    req.session.user = currentUser;
    currentEnd.apply(res, arguments);
  };

  stage.start();
};