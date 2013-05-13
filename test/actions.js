var assert = require('assert');
process.env['GB_ENV'] = 'test';
var noop = require('noop');
var moment = require('moment');
var omf = require('omf');
var ok = require('okay');
var db = require(__dirname + '/../db');

var tableName = 'actions';
var actions = db.tables.actions;

var url = '/v1/actions';
var app = require(__dirname + '/../lib/server').createAppServer()
omf(app, function(app) {
  var assertActions = function(options, count, more) {
    more = more || global.noop;
    before(function(done) {
      db.query(actions.delete(), done);
    });
    app.post(url, options || {}, function(res) {
      res.has.statusCode(204);
      it('creates ' + count + ' actions', function(done) {
        var self = this;
        //TODO - this might be in a race w/ the insert query in the middleware
        setTimeout(function() {
          db.query('SELECT * FROM actions', ok(done, function(rows) {
            assert(rows, 'rows is missing');
            assert.equal(rows.length, count, 'should return ' + count + ' row but returned ' + rows.length);
            self.rows = rows;
            done();
          }));
        }, 30)
      });
      more();
    });
  };

  describe('invalid HTTP methods', function() {
    app.get(url, 404);
    app.put(url, 404);
    app.del(url, 404);
  });

  describe('invalid URLs', function() {
    app.post('/v2/actions', 404);
    app.post('/v1/action', 404);
    app.post('/v1/actionz', 404);
  });

  describe('invalid action bodies', function() {
    describe('no body', function() {
      assertActions(null, 0);
    });

    describe('empty body', function() {
      assertActions({}, 0);
    });
  });

  describe('simple action', function() {
    var action = {
      type: 'blue-like-button-clicked'
    };
    var options = {json: action};
    assertActions(options, 1, function() {
      it('has correct type', function() {
        var row = this.rows[0];
        assert.equal(row.type, action.type);
      });

      it('has date set to insert time', function() {
        var row = this.rows[0];
        assert(row.dateTime);
        var stamp = moment(row.dateTime);
        moment().isSame(stamp, 'minute');
      });
    });
  });

  describe('action with all info', function() {
    var action = {
      type: 'photo-clicked',
      dateTime: moment().year(2013).month(0).toDate(),
      userId: 1,
      productId: 500,
      source: 'magic',
      sourceVersion: '1.0.1beta2',
      deviceId: '100',
      locationId: 311,
      data: {
        set: 'data',
        works: true,
        withNumbers: 10
      }
    };
    var options = { json: action };
    assertActions(options, 1, function() {
      it('has correct type', function() {
        var row = this.rows[0];
        assert.equal(row.type, 'photo-clicked');
      });

      it('has correct date', false);

      it('saves all optional properties', function() {
        var row = this.rows[0];
        assert.equal(row.userId, 1);
        assert.equal(row.productId, 500);
        assert.equal(row.source, 'magic');
        assert.equal(row.sourceVersion, action.sourceVersion);
        assert.equal(row.deviceId, action.deviceId);
        assert.equal(row.locationId, action.locationId);
        assert.deepEqual(row.data, action.data);
      });
    });
  });

  describe('action with invalid info', function() {
    var action = {
      aligator: true,
      cheeseburger: 'yeah, totes'
    };
    var options = { json: action };
    assertActions(options, 0);
  });

  describe('action with valid & invalid info', function() {
    var action = {
      type: 'first-date',
      aligator: true,
      cheeseburger: 'yeah, totes'
    };
    var options = { json: action };
    assertActions(options, 1, function() {
      it('saves type', function() {
        assert.equal(this.rows[0].type, 'first-date');
      });
    });
  });
});
