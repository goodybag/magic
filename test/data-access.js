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

      it('tons of queries stick to the correct domain', function(done) {
        async.times(50, function(count, cb) {
          var domain = require('domain').create();
          domain.name = 'loop' + count;
          domain.on('error', cb);
          domain.run(function() {
            db.query('SELECT NOW()', function(err, rows) {
              assert.ifError(err);
              assert.strictEqual(process.domain, domain, 'error detached on success query');
              db.query('asdlfkajsdlf', function(err, rows) {
                assert(err);
                assert.strictEqual(process.domain, domain, 'domain detached on error query');
                cb();
              })
            })
          });
        }, done);
      });
    });

    it('tons of clients and queries stick to the correct domain', function(done) {
      async.times(50, function(count, cb) {
        var domain = require('domain').create();
        domain.name = 'loop'
        domain.run(function() {
          assert.strictEqual(process.domain, domain);
          db.getClient(function(err, client) {
            assert.ifError(err, 'error getting client');
            assert.strictEqual(process.domain, domain, 'domain detached on successful get client');;
            client.query('SELECT NOW()', function(err, rows) {
              assert.ifError(err);
              assert.strictEqual(process.domain, domain, 'domain detached on successful query');
              client.query('slakdjf', function(err) {
                assert(err);
                assert.strictEqual(process.domain, domain, 'domain detached on error query');
                cb();
              });
            });
          });
        });
      }, done);
    });
  });

  describe('client errors', function() {
    //break con string to force connect error
    before(function() {
      this.config = require(__dirname + '/../config');
      this.postgresConnStr = config.postgresConnStr;
      config.postgresConnStr = 'pg://localhost:39813/1o3847';
    });

    //reset the con string
    after(function() {
      this.config.postgresConnStr = this.postgresConnStr;
    });

    it('tons of client errors stick to the correct domain', function(done) {
        async.times(50, function(count, cb) {
        var domain = require('domain').create();
        var domain = require('domain').create();
        domain.name = 'loop' + count;
        domain.run(function() {
          assert.strictEqual(process.domain, domain);;
          db.getClient(function(err, client) {
            assert(err);
            assert.strictEqual(process.domain, domain, 'domain detach on client connect error');;
            cb();
          });
        });
      }, done);

    });
  });
});
