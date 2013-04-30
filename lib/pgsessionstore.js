var Store = require('express').session.Store;
var db = require('../db');
var ok = require('okay');
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
  db.getClient(['session-set'], function(error, client, done) {
    var after = function() {
      done();
      cb();
    }
    if (error) {
      logger.error(['pgsessionstore'], error);
      return cb(error);
    }
    sessData = JSON.stringify(sessData);
    db.upsert(
      client,
      'UPDATE sessions SET data=$2 WHERE id=$1', [sid, sessData],
      'INSERT INTO sessions (id, data, expiration) VALUES ($1, $2, $3)', [sid, sessData, expiration],
      after
    );
  });
};

PGSessionStore.prototype.get = function(sid, cb) {
  db.query('SELECT data FROM sessions WHERE id = $1', [sid], ok(cb, function(rows, result) {
    cb(null, rows.length ? JSON.parse(rows[0].data) : null);
  }));
};

PGSessionStore.prototype.destroy = function(sid, cb) {
  db.query('DELETE FROM sessions WHERE id = $1', [sid], cb);
};

PGSessionStore.prototype.length = function(cb) {
  db.query('SELECT count(id) AS count FROM sessions', ok(cb, function(rows) {
    cb(null, rows[0].count);
  }));
};

PGSessionStore.prototype.clear = function(cb) {
  db.query('DELETE FROM sessions', cb);
};

module.exports = PGSessionStore;
