var assert = require('assert');
var ok = require('okay');
var db = require('../db');
var analytics = require('../lib/business-analytics');

describe('business-analytics', function() {
  beforeEach(function(done) {
    var self = this;
    db.getClient(ok(done, function(client, release) {
      client.query('BEGIN', ok(done, function() {
        self.client = client;
        self.release = release;
        done();
      }));
    }));
  });

  describe('for a business', function() {
    it('returns results', function(done) {
      analytics.forBusiness(this.client, 2, ok(done, function(result) {
        assert(result);
        assert.equal(result.totalLikes, 0, 'result should have total likes')
        assert.equal(result.totalPunches, 0, 'result should have 0 punches but found ' + result.totalPunches)
        assert.equal(result.totalUsers, 0, 'result should have total users likes')
        done();
      }));
    });
  });

  describe('for a location', function() {
    it('returns results', function(done) {
      analytics.forLocation(this.client, 1, ok(done, function(result) {
        assert(result);
        assert.equal(result.totalLikes, 12, 'result should have total likes of ' + 0 + ' but got ' + result.totalLikes)
        assert.equal(result.totalPunches, 0, 'result should have total punches of ' + 0 + ' but got ' + result.totalPunches);
        assert.equal(result.totalUsers, 0, 'result should have total users of ' + 0 + ' but got ' + result.totalUsers)
        done();
      }));
    });
  });

  afterEach(function(done) {
    var self = this;
    this.client.query('ROLLBACK', ok(done, function() {
      self.release();
      done();
    }));
  });
});
