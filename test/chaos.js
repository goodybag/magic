/**
 * The Chaos Tests
 *
 * split in two sections: document types, which abstract over the input data, and functions, which run against the document types
 * - to add a test, implement the function in the Processes section, then add it to the ResourceDoc makeTests() list
 * - input documents are listed at the bottom of the file
 */


var yaml = require('js-yaml');
var tu = require('../lib/test-utils');
var assert = require('better-assert');

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj)); // :TODO: non-hack deepclone
}

// request dispatch helper
function request(methodDoc, requestDoc, cb) {
  var doRequest = function() {
    tu.httpRequest(requestDoc.toOptions(), requestDoc.toPayload(), function(err, result, res) {
      if (methodDoc.needsAuth()) {
        tu.logout(function() { cb(res, result); })
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
};


// Processes
// =========

// Main
function doChaos(resourceDoc) {
  describe(resourceDoc.makeTestDescription(), function() {
    resourceDoc.makeTests().runEach();
  });
}

// A test type
function testValidRequest(methodDoc) {
  it('should respond 200 on '+methodDoc.getDesc()+' with valid input', function(done) {
    var requestDoc = methodDoc.makeRequestDoc();
    request(methodDoc, requestDoc, function(res, result) {
      if (res.statusCode !== 200)
        console.log('Failed chaos valid-request test'),
          console.log(require('util').inspect(requestDoc, true, 10)),
          console.log(res.statusCode),
          console.log(result);
      assert(res.statusCode == 200);
      done();
    });
  });
}

// A test type
function testInvalidRequest(methodDoc, corruptKey) {
  // check if attribute is corruptable
  if (/^any/.test(methodDoc.getAttrType(corruptKey)))
    return;

  it('should respond 400 on '+methodDoc.getDesc()+' with invalid input', function(done) {
    var requestDoc = methodDoc.makeRequestDoc();

    // corrupt the value
    requestDoc.setInput(corruptKey, (function(type) {
      switch (type) {
        case 'string*':
        case 'string':
        case 'url':
          return 123456789;
        case 'int':
          return 'CORRUPTION STRING';
      }
    })(methodDoc.getAttrType(corruptKey)));

    request(methodDoc, requestDoc, function(res, result) {
      if (res.statusCode !== 400)
        console.log('Failed chaos invalid-request test'),
          console.log(require('util').inspect(requestDoc, true, 10)),
          console.log(res.statusCode),
          console.log(result);
      assert(res.statusCode == 400);
      done();
    });
  });
}


// Functions List
// ==============
// helper for collecting tests to run
function FunctionsList() {
  this.fns = [];
}
FunctionsList.prototype.add = function() {
  this.fns.push({ fn:arguments[0], args:Array.prototype.slice.call(arguments, 1) });
};
FunctionsList.prototype.runEach = function() {
  this.fns.forEach(function(item) {
    item.fn.apply(null, item.args);
  });
};


// Resource Document
// =================
// represents the entire resource -- the top of the structure
function ResourceDoc(data) {
  this.data = deepClone(data);
}
ResourceDoc.prototype.makePath = function() {
  if (this.__path) { return this.__path; }
  var path = this.data.resource.path;
  for (var k in this.data.resource.params) {
    path = path.replace(RegExp(':'+k,'ig'), this.data.resource.params[k].eg);
  }
  this.__path = path;
  return path;
};
ResourceDoc.prototype.makeTestDescription = function() { return 'Chaos: '+this.data.resource.path; }
ResourceDoc.prototype.iterateMethods = function(cb) {
  for (var methodName in this.data.methods) {
    if (/delete/i.test(methodName)) continue; // can't do DELETE without losing our test data
    var method = new MethodDoc(this, methodName);
    cb(method);
  }
};

// Tests Composition: add any new tests here!
ResourceDoc.prototype.makeTests = function() {
  var tests = new FunctionsList();
  this.iterateMethods(function(method) {
    tests.add(testValidRequest, method);
    method.iterateAttributes(function(key) {
      tests.add(testInvalidRequest, method, key);
    })
  });
  return tests;
};


// Method Document
// ===============
// represents a single method on a resource
function MethodDoc(resourceDoc, methodName) {
  this.resourceDoc = resourceDoc;
  this.methodName = methodName;
  this.data = deepClone(resourceDoc.data.methods[methodName]);

  this.attrs = (methodName == 'get') ? this.data.query : this.data.body;
  this.attrKeys = (this.attrs) ? Object.keys(this.attrs) : [];
  this.numAttr = this.attrKeys.length;
}
MethodDoc.prototype.getDesc = function() { return this.data.desc; };
MethodDoc.prototype.getAttrType = function(key) { return this.attrs[key].type; };
MethodDoc.prototype.needsAuth = function() { return (this.data.auth && this.data.auth.required) };
MethodDoc.prototype.getAuthCreds = function() { return this.data.auth.eg; };
MethodDoc.prototype.iterateAttributes = function(cb) { this.attrKeys.forEach(cb); };
MethodDoc.prototype.makeRequestDoc = function() {
  var reqDesc = {
    method: this.methodName.toUpperCase(),
    path: '/v1'+this.resourceDoc.makePath()
  };
  if (this.methodName == 'get')
    reqDesc.query = this.data.query;
  else 
    reqDesc.body = this.data.body;
  return new RequestDoc(reqDesc);
};


// Request Document
// ================
// represents a single request to a resource
function RequestDoc(data) {
  this.data = deepClone(data);
}
RequestDoc.prototype.setInput = function(key, value) {
  if (this.data.query) {
    this.data.query[key].eg = value;
  } else if (this.data.body) {
    this.data.body[key].eg = value;
  }
};
RequestDoc.prototype.toOptions = function() {
  var options = deepClone(this.data);
  options.headers = options.headers || {};

  if (options.body) {
    delete options.body;
    options.headers['content-type'] = 'application/json';
  }

  if (options.query) {
    var queryParams = [];
    for (var k in options.query) {
      if (Array.isArray(options.query[k].eg)) {
        for (var i=0; i < options.query[k].eg.length; i++) {
          queryParams.push(k+'[]='+options.query[k].eg[i]);
        }
      } else {
        queryParams.push(k+'='+options.query[k].eg);
      }
    }
    options.path += '?'+queryParams.join('&').replace(/ /g, '+');
    delete options.query;
  }

  return options;
};
RequestDoc.prototype.toPayload = function() {
  if (this.data.body) {
    var payload = {};
    for (var k in this.data.body) {
      payload[k] = this.data.body[k].eg;
    }
    return JSON.stringify(payload);
  }
  return null;
};


// Run Chaos Tests
// ===============
function loadDescription(collection, cb) {
  var doc = require('fs').readFileSync('./collections/'+collection+'/description.yaml', 'utf8');
  yaml.loadAll(doc, function(data) { cb(new ResourceDoc(data)); });
}

loadDescription('businesses', doChaos);