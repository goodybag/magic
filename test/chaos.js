/**
 * The Chaos Tests
 *
 *  makeTestsBatch(cb)
 *   - returns a function which takes a doci.Resource instance and runs the test suite defined in cb

var doChaos = chaos.makeTestsBatch(function(resource) {
  resource.iterateMethods(function(method) {
    chaos.testValidRequest, method);
    batch.add(chaos.testExtradataRequest, method);
    method.iterateAttributes(function(key) {
      batch.add(chaos.testPartialRequest, method, key);
      batch.add(chaos.testInvalidRequest, method, key);
    });
  });
});
//...
doChaos(new doci.Resource(require('mydoc.yaml')));

 *
 *  testValidRequest(methodDoc)
 *   - sends a well-formed request
 *
 *  testExtradataRequest(methodDoc)
 *   - sends a request with one random key added to the body or query
 *
 *  testPartialRequest(methodDoc, onlyKey)
 *   - sends a rquest with all attributes removed from the request/body except for the one matching `onlyKey`
 *
 *  testInvalidRequest(methodDoc, corruptKey)
 *   - sends a request with the attribute matching `corruptKey` set to a value that won't pass validation
 */


var tu = require('../lib/test-utils');
var assert = require('better-assert');

// request dispatch helper
function request(methodDoc, requestDoc, cb) {
  var doRequest = function() {
    tu.httpRequest(requestDoc.toOptions(), requestDoc.toPayload(), function(err, result, res) {
      if (methodDoc.needsAuth()) {
        tu.logout(function() { cb(res, result); });
      } else {
        cb(res, result);
      }
    });
  };

  if (methodDoc.needsAuth()) {
    tu.login(methodDoc.getAuthCreds(), doRequest);
  } else {
    doRequest();
  }
}

// EXPORTED
function testValidRequest(methodDoc) {
  it('should respond 200 on '+methodDoc.getDesc()+' with valid input', function(done) {
    var requestDoc = methodDoc.makeRequestDoc();
    request(methodDoc, requestDoc, function(res, result) {
      var is2xx = (res.statusCode >= 200 && res.statusCode < 300);
      if (!is2xx)
        console.log('Failed chaos valid-request test'),
          console.log(requestDoc.toOptions(), requestDoc.toPayload()),
          console.log(res.statusCode),
          console.log(result);
      assert(is2xx);
      done();
    });
  });
}

// EXPORTED
function testExtradataRequest(methodDoc) {
  if (methodDoc.hasNoAttrs() || methodDoc.methodName == 'get') return;

  it('should respond 400 on '+methodDoc.getDesc()+' with unsupported input', function(done) {
    var requestDoc = methodDoc.makeRequestDoc();

    requestDoc.setInput('somekey'+Math.round(100 * Math.random()), 'foobar');

    request(methodDoc, requestDoc, function(res, result) {
      if (res.statusCode !== 400)
        console.log('Failed chaos extradata-request test'),
          console.log(requestDoc.toOptions(), requestDoc.toPayload()),
          console.log(res.statusCode),
          console.log(result);
      assert(res.statusCode == 400);
      done();
    });
  });
}

// EXPORTED
function testPartialRequest(methodDoc, onlyKey) {
  it('should respond 400 on '+methodDoc.getDesc()+' with invalid input', function(done) {
    var requestDoc = methodDoc.makeRequestDoc();

    // filter out all but the target key
    var removedRequiredField = false;
    methodDoc.iterateAttributes(function(key) {
      if (key != onlyKey)
        removedRequiredField = removedRequiredField || requestDoc.clearInput(key);
    });
    if (/requires/.test(methodDoc.getAttrType(onlyKey)))
      removedRequiredField = true;

    var expectedStatusRange = (removedRequiredField) ? 4 : 2;
    request(methodDoc, requestDoc, function(res, result) {
      var statusRange = Math.floor(res.statusCode/100);
      if (statusRange !== expectedStatusRange)
        console.log('Failed chaos partial-request test (expected '+expectedStatusRange+'xx)'),
          console.log(requestDoc.toOptions(), requestDoc.toPayload()),
          console.log(res.statusCode),
          console.log(result);
      assert(statusRange == expectedStatusRange);
      done();
    });
  });
}

// EXPORTED
function testInvalidRequest(methodDoc, corruptKey) {
  // check if attribute is corruptable
  if (/^string/.test(methodDoc.getAttrType(corruptKey)))
    return;

  it('should respond 400 on '+methodDoc.getDesc()+' with invalid input', function(done) {
    var requestDoc = methodDoc.makeRequestDoc();

    // corrupt the value
    requestDoc.setInput(corruptKey, (function(type) {
      if (/string|url|email|bool|object/.test(type))
        return 123456789;
      if (/int|float|id|cardid|time|group/.test(type))
        return 'CORRUPTION STRING';
    })(methodDoc.getAttrType(corruptKey)));
    request(methodDoc, requestDoc, function(res, result) {
      if (res.statusCode !== 400)
        console.log('Failed chaos invalid-request test ('+corruptKey+')'),
          console.log(requestDoc.toOptions(), requestDoc.toPayload()),
          console.log(res.statusCode),
          console.log(result);
      assert(res.statusCode == 400);
      done();
    });
  });
}

// EXPORTED
function makeTestsBatch(cb) {
  return function(resourceDoc) {
    describe(resourceDoc.makeTestDescription(), function() {
      cb(resourceDoc);
    });
  };
}

module.exports = {
  makeTestsBatch:       makeTestsBatch
, testValidRequest:     testValidRequest
, testExtradataRequest: testExtradataRequest
, testPartialRequest:   testPartialRequest
, testInvalidRequest:   testInvalidRequest
}