var Store = require('express').session.Store;
var db = require('../db');
var logger = require('./logger')({app: 'api', component: 'db'});

function PGSessionStore() {
  Store.call(this);
}
PGSessionStore.prototype = Object.create(Store.prototype);

PGSessionStore.prototype.set = function(sid, sessData, cb) {
  var expiration = null;
  if (sessData.cookie && sessData.cookie.expires) {
    expiration = sessData.cookie.expires;
  }
  db.getClient(function(error, client) {
    if (error) {
      logger.log(['pgsessionstore'], error);
      return cb(error);
    }
    sessData = JSON.stringify(sessData);
    db.upsert(
      client,
      'UPDATE sessions SET data=$2 WHERE id=$1', [sid, sessData],
      'INSERT INTO sessions (id, data, expiration) VALUES ($1, $2, $3)', [sid, sessData, expiration],
      cb
    );
  });
};

PGSessionStore.prototype.get = function(sid, cb) {
  this._db('SELECT data FROM sessions WHERE id = $1', [sid], cb, function(result) {
    if (result.rows.length === 1) {
      return JSON.parse(result.rows[0].data);
    }
    return null;
  });
};

PGSessionStore.prototype.destroy = function(sid, cb) {
  this._db('DELETE FROM sessions WHERE id = $1', [sid], cb);
};

PGSessionStore.prototype.length = function(cb) {
  this._db('SELECT count(id) AS count FROM sessions', undefined, cb, function(result) {
    return result.rows[0].count;
  });
};

PGSessionStore.prototype.clear = function(cb) {
  this._db('DELETE FROM sessions', undefined, cb);
};

// helper to run simple queries
PGSessionStore.prototype._db = function(query, queryParams, continuationCb, successCb) {
  db.getClient(function(error, client) {
    if (error) {
      logger.log(['pgsessionstore'], error);
      return continuationCb(error);
    }

    client.query(query, queryParams, function(error, result) {
      if (error) {
        logger.log(['pgsessionstore'], error);
        continuationCb(error);
      }
      else {
        continuationCb(null, (successCb) ? successCb(result) : undefined);
      }
    });
  });
};

module.exports = PGSessionStore;