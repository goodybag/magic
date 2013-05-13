var assert = require('assert');
process.env['GB_ENV'] = 'test';
var noop = require('noop');
var moment = require('moment');
var omf = require('omf');
var express = require('express');
var app = express();
var ok = require('okay');

var tableName = 'actions';
var db = require(__dirname + '/../db');
var sql = require('sql');


var actions = sql.define({
  name: 'actions',
  columns: [
    'type', 'dateTime', 'userId', 'productId', 
    'source', 'sourceVersion', 'deviceId', 'locationId', 'data']
});

var validBody = function(body) {
  return body && body.type;
};
var express = require('express');
var actionsApp = express();
actionsApp.post('/v1/actions', function(req, res, next) {
  //return 204 no content right away
  //send empty json because some http clients can't
  //handle how awesome 204 is without a response body
  res.writeHead(204, {'content-type':'application/json'});
  res.end('{}');
  var body = req.body;
  if(validBody(body)) {
    process.nextTick(function() {
      //clean posted body
      var row = {
        type: body.type,
        dateTime: body.dateTime || new Date(),
        userId: body.userId,
        productId: body.productId,
        source: body.source,
        sourceVersion: body.sourceVersion,
        deviceId: body.deviceId,
        locationId: body.locationId,
        data: body.data
      };
      db.query(actions.insert(row), function(err, rows, result) {
        if(err) console.log(err);
      });
    });
  }
})

app.use(express.bodyParser());
app.use(actionsApp);

var url = '/v1/actions';
omf(app, function(app) {
  before(function(done) {
    var columns = [
      '"type" text',
      '"dateTime" TIMESTAMP DEFAULT NOW()',
      '"userId" INT',
      '"productId" INT',
      '"source" TEXT',
      '"sourceVersion" TEXT',
      '"deviceId" INT',
      '"locationId" INT',
      '"data" JSON'
    ]
    var q = 'CREATE TABLE IF NOT EXISTS ' + tableName + '(' + columns.join(' ,') + ')';
    db.query(q, done);
  });
  after(function() {
    db.query('DROP TABLE actions');
    require('pg').end();
  });

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
