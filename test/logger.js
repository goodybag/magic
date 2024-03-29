var assert = require('assert');
var Logger = require(__dirname + '/../lib/logger');
var errors  = require(__dirname + '/../lib/errors');

describe('logger', function() {
  var logger = new Logger('test');
  it('initializes with app name', function() {
    assert.equal(logger.meta.app, 'api');
  });

  it('initializes with a component name', function() {
    assert.equal(logger.meta.component, 'test');
  });

  it('sends simple message to gelf', function(done) {
    logger.once('gelf', function(msg) {
      assert.equal(msg.level, 7);
      assert.equal(msg.version, '1.0', 'should have version 1.0');
      assert.equal(msg.short_message, 'test');
      assert(!msg.full_message, 'should not have a full message');
      assert.equal(msg.facility, logger.meta.component);
      assert.equal(typeof msg.timestamp, 'number');
      done();
    });
    logger.debug('test');
  });

  it('logs with single tag', function(done) {
    logger.once('gelf', function(msg) {
      assert(!require('util').isArray(msg._tags));
      assert.equal(msg._tags, 'tag');
      assert.equal(msg.short_message, 'test');
      done();
    });
    logger.debug('tag', 'test');
  });

  it('logs with multiple tags', function(done) {
    logger.once('gelf', function(msg) {
      assert(!require('util').isArray(msg._tags));
      assert.equal(msg._tags, 'tag1, tag2');
      assert.equal(msg.short_message, 'test');
      done();
    });
    logger.debug(['tag1', 'tag2'], 'test');
  });

  it('logs with meta', function(done) {
    logger.once('gelf', function(msg) {
      assert.equal(msg._some, 'info');
      assert.equal(msg._awesome, 'true');
      assert.equal(msg.level, 6);
      done();
    });
    logger.info('hey hey', {some: 'info', awesome: 'true'});
  });

  describe('3 arguments', function() {
    it('logs with string tags', function(done) {
      logger.once('gelf', function(msg) {
        assert.equal(msg._tags, 'hay hay');
        assert.equal(msg._some, 'meta');
        assert.equal(msg.short_message, 'message');
        done();
      })
      logger.info('hay hay', 'message', {some: 'meta'});
    });

    it('logs with array tags', function(done) {
      logger.once('gelf', function(msg) {
        assert.equal(msg._tags, 'hay hay, hoy');
        assert.equal(msg._some, 'meta');
        assert.equal(msg.short_message, 'message');
        done();
      })
      logger.info(['hay hay', 'hoy'], 'message', {some: 'meta'});
    });
  });

  describe('error', function() {
    it('logs with single error argument', function(done) {
      logger.once('gelf', function(msg) {
        assert.equal(msg.level, 3);
        assert.equal(msg.short_message, 'omg');
        assert(msg.full_message, 'should have full message');
        assert(msg.full_message.indexOf('omg') > -1, 'full message should contain stack');
        done();
      });
      logger.error(new Error('omg'));
    });
    it('logs with second error argument', function(done) {
      logger.once('gelf', function(msg) {
        assert.equal(msg.level, 3);
        assert.equal(msg.short_message, 'omg');
        assert.equal(msg._tags.length, 3);
        assert(msg.full_message, 'should have full message');
        assert(msg.full_message.indexOf('omg') > -1, 'full message should contain stack');
        done();
      });
      logger.error('tag', new Error('omg'));
    });
    it('logs with third error argument', function(done) {
      logger.once('gelf', function(msg) {
        assert.equal(msg.level, 3);
        assert.equal(msg._tags, 'something');
        assert.equal(msg.short_message, 'okay');
        assert(msg.full_message, 'should have full message');
        assert(msg.full_message.indexOf('omg') > -1, 'full message should contain stack');
        done();
      });
      logger.error('something', 'okay', new Error('omg'));
    });
    it('logs custom error objects properly as single argument', function(done) {
      logger.once('gelf', function(msg) {
        assert.equal(msg.short_message, 'INVALID_PARTIAL_REGISTRATION_TOKEN');
        assert.equal(msg._type, 'auth');
        assert.equal(msg._code, '0016');
        assert.equal(msg._tags, []);
        done();
      });
      logger.error(errors.auth.INVALID_PARTIAL_REGISTRATION_TOKEN);
    });
    it('logs custom error objects properly with tags',  function(done) {
      logger.once('gelf', function(msg) {
        assert.equal(msg.short_message, 'INVALID_PARTIAL_REGISTRATION_TOKEN');
        assert.equal(msg._type, 'auth');
        assert.equal(msg._code, '0016');
        assert.equal(msg._tags, 'something');
        done();
      });
      logger.error(['something'], errors.auth.INVALID_PARTIAL_REGISTRATION_TOKEN);
    });
    it('logs NULL error message properly', function(done) {
      logger.once('gelf', function(msg) {
        assert.equal(msg.short_message, 'null')
        done();
      });
      logger.error(['something'], null);
    });
  });
});
