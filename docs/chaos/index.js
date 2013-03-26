var cascade = require('../cascade');
var opsMachine = require('../ops-machine');
var reduceMachine = require('../reduce-machine');
var stylesDoc = cascade.loadDocument('./styles.yaml');
var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');

// EXPORTED
function runTests(cascadeDoc) {
  var doc = cascadeDoc.applyStyles(stylesDoc);
  // run any preparation ops
  opsMachine.run(doc, {
    makeQueryString: function(key, obj, params) {
      // :TODO:
    },
    makePathString: function(key, obj, params) {
      // :TODO:
    },
    makePayload: function(key, obj, params) {
      // :TODO:
    },
    concat: function(key, obj, params) {
      // :TODO:
    }
  });
  // reduce the document into our test suites
  var testSuites = reduceMachine.run(doc, {
    resource: function(index, desc, reduceChildren) {
      var methodTests = reduceChildren(desc);
      return new Suite('Chaos: '+desc.resource.path, methodTests);
    },
    method: function(method, methodDoc) {
      // assemble the test suite
      var tests = [
        [testValidRequest, method, methodDoc],
        [testExtradataRequest, method, methodDoc]
      ];
      for (var key in method.attrs) {
        tests.push([testPartialRequest, method, methodDoc, key]);
        tests.push([testInvalidRequest, method, methodDoc, key]);
      }
      return tests;
    }
  });
  // run tests
  testSuites.forEach(function(suite){ suite.run(); });
}

// Test Suite
// - runs a collection of mocha test functions under a description
function Suite(desc, tests) {
  this.desc  = desc;
  this.tests = tests || [];
}
Suite.prototype.run = function() {
  var self = this;
  describe(this.desc, function() {
    self.tests.forEach(function(test) {
      test.call();
    });
  });
};

// request dispatch helper
function request(opts, payload, auth, cb) {
  var doRequest = function() {
    tu.httpRequest(opts, payload, function(err, result, res) {
      if (auth)
        tu.logout(function() { cb(res, result); });
      else
        cb(res, result);
    });
  };

  if (auth)
    tu.login(auth, doRequest);
  else
    doRequest();
}

// runs request with example values given in description
function testValidRequest(method, methodDoc) {
  it('should respond 200 on '+methodDoc.desc+' with valid input', function(done) {
    
    var opts = {
      method: method,
      path: methodDoc.requestPath,
      headers:{ accept:'application/json' }
    };
    if (methodDoc.payload)
      opts.headers['content-type'] = 'application/json';

    request(opts, methodDoc.payload, methodDoc.authCreds, function(res, result) {
      var is2xx = (res.statusCode >= 200 && res.statusCode < 300);
      if (!is2xx)
        console.log('Failed chaos valid-request test'),
          console.log(opts, methodDoc.payload),
          console.log(res.statusCode),
          console.log(result);
      assert(is2xx);
      done();
    });
  });
}

// adds a random attribute
function testExtradataRequest(method, methodDoc) {
  if (!methodDoc.body || method == 'get') return; // no need when request body isnt significant
  // :TODO: probably should run on GET

  it('should respond 400 on '+methodDoc.desc+' with unsupported input', function(done) {

    var opts = {
      method: method,
      path: methodDoc.requestPath,
      headers:{ accept:'application/json', 'content-type':'application/json' }
    };
    var payload = utils.deepClone(methodDoc.payload);
    payload['somekey'+Math.round(100 * Math.random())] = 'foobar';

    request(opts, payload, methodDoc.authCreds, function(res, result) {
      if (res.statusCode !== 400)
        console.log('Failed chaos extradata-request test'),
          console.log(opts, payload),
          console.log(res.statusCode),
          console.log(result);
      assert(res.statusCode == 400);
      done();
    });
  });
}

// removes the given attribute
function testPartialRequest(method, methodDoc, onlyKey) {
  if (!methodDoc.body || method == 'get') return; // no need when request body isnt significant

  it('should respond 400 on '+methodDoc.desc+' with invalid input', function(done) {

    var opts = {
      method: method,
      path: methodDoc.requestPath,
      headers:{ accept:'application/json', 'content-type':'application/json' }
    };
    var payload = utils.pick(methodDoc.payload, onlyKey);
    var removedRequiredField = (method == 'get') ? methodDoc.query[onlyKey].required : methodDoc.body[onlyKey].required;
    var expectedStatusRange = (removedRequiredField) ? 4 : 2;

    request(opts, payload, methodDoc.authCreds, function(res, result) {
      var statusRange = Math.floor(res.statusCode/100);
      if (statusRange !== expectedStatusRange)
        console.log('Failed chaos partial-request test (expected '+expectedStatusRange+'xx)'),
          console.log(opts, payload),
          console.log(res.statusCode),
          console.log(result);
      assert(statusRange == expectedStatusRange);
      done();
    });
  });
}

// corrupts the given attribute
function testInvalidRequest(method, methodDoc, corruptKey) {
  if (!methodDoc.body || method == 'get') return; // no need when request body isnt significant
  // :TODO: probably should run on GET

  it('should respond 400 on '+methodDoc.getDesc()+' with invalid input', function(done) {
    
    var opts = {
      method: method,
      path: methodDoc.requestPath,
      headers:{ accept:'application/json', 'content-type':'application/json' }
    };
    var payload = utils.deepClone(methodDoc.payload);

    // corrupt the value
    var attrs = (method == 'get') ? methodDoc.query : methodDoc.body;
    var type = attrs[corruptKey].type;
    if (/string|url|email|bool/.test(type))
      attrs[corruptKey] = 123456789;
    if (/int|float|id|cardid|time|group/.test(type))
      attrs[corruptKey] = 'CORRUPTION STRING';

    request(opts, payload, methodDoc.authCreds, function(res, result) {
      if (res.statusCode !== 400)
        console.log('Failed chaos invalid-request test ('+corruptKey+')'),
          console.log(opts, payload),
          console.log(res.statusCode),
          console.log(result);
      assert(res.statusCode == 400);
      done();
    });
  });
}

module.exports = {
  runTests: runTests
};