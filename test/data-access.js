//low level data access tests
var util = require('util');
var assert = require('assert');

var async = require('async');
var sql = require('sql');

var db = require(__dirname + '/../db');

describe('data access', function() {
  describe('query', function() {
    describe('with string', function() {
      it('works', function(done) {
        db.query('SELECT NOW()', function(err, rows, result) {
          assert.ifError(err);
          assert(rows, 'should return rows');
          assert(util.isArray(rows), 'result should be an array');
          assert(result, 'should return result object');
          done();
        });
      });

      describe('with string and params', function() {
        it('works', function(done) {
          db.query('SELECT NOW() WHERE 1 = $1', [1], function(err, rows) {
            assert.ifError(err);
            assert.equal(rows.length, 1);
            done();
          });
        });
      });

      describe('with something that implements .toQuery()', function() {
        it('works', function(done) {
          var users = sql.define({
            name: 'users',
            columns: ['id', 'bla']
          });

          db.query(users.select('id').limit(1), function(err, rows) {
            assert.ifError(err);
            assert.equal(rows.length, 1);
            done();
          });
        });
      });

      it('tons of queries dont exhaust pool', function(done) {
        async.times(50, function(count, cb) {
          db.query('SELECT NOW()', function(err, rows) {
            assert.ifError(err);
            assert.equal(rows.length, 1);
            cb();
          });
        }, done);
      });
    });
  });
});
