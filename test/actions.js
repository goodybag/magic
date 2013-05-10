var assert = require('assert');
process.env['GB_ENV'] = 'test';
var noop = require('noop');
var moment = require('moment');
var omf = require('omf');
var express = require('express');
var app = express();
var ok = require('okay');

var db = require(__dirname + '/../db');
var sql = require('sql');


var tableName = 'actions';
var actions = sql.define({
  name: 'actions',
  columns: ['type', 'dateTime']
});

var validBody = function(body) {
  return body && body.type;
};
var middleware = function(req, res, next) {
  if(req.method != 'POST') return next();
  if(req.url != '/') return next();
  //return 204 no content right away
  //send empty json because some http clients can't
  //handle how awesome 204 is without a response body
  res.writeHead(204, {'content-type':'application/json'});
  res.end('{}');
  var body = req.body;
  if(validBody(body)) {
    process.nextTick(function() {
      db.query(actions.insert(body), function(err, rows, result) {
      });
    });
  }
};
var url = '/v1/actions';

app.use(express.bodyParser());
app.use('/v1/actions', middleware);

omf(app, function(app) {
  before(function(done) {
    var q = 'CREATE TABLE IF NOT EXISTS ' + tableName + '(type text, "dateTime" TIMESTAMPTZ DEFAULT NOW())';
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
        db.query('SELECT * FROM actions', ok(done, function(rows) {
          assert(rows, 'rows is missing');
          assert.equal(rows.length, count, 'should return ' + count + ' row but returned ' + rows.length);
          self.rows = rows;
          done();
        }));
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
});
