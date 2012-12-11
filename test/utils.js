var assert = require('better-assert');
var sinon = require('sinon');

var utils = require('../utils');

describe('validate', function() {

  it('should give success for a valid schema', function() {
    var data = { strVal:'a string', numVal:5 };
    var schema = {
      type:'object',
      properties:{
        strVal:{
          required:true,
          type:'string',
          length:8
        },
        numVal:{
          required:true,
          type:'number',
          minimum:1,
          maximum:10
        }
      }
    };

    utils.validate(data, schema, function(errors) {
      assert(!errors);
    });
  });

  it('should provide errors for an invalid schema', function() {
    var data = { strVal:5, numVal:11 };
    var schema = {
      type:'object',
      properties:{
        strVal:{
          required:true,
          type:'string',
          length:8
        },
        numVal:{
          required:true,
          type:'number',
          minimum:1,
          maximum:10
        }
      }
    };

    utils.validate(data, schema, function(errors) {
      assert(errors);
      assert(errors[0].property == 'strVal');
      assert(errors[0].validator == 'type');
      assert(errors[1].property == 'numVal');
      assert(errors[1].validator == 'maximum');
    });
  });

});

describe('expandDoc', function() {

  it('should expand a flattened query object', function() {
    var doc = utils.expandDoc({ 'foo':1, 'foo.bar':2, 'foo.baz':3, 'hi':5 });
    
    assert(doc.foo.bar === 2);
    assert(doc.foo.baz === 3);
    assert(doc.hi === 5);
  });

  it('should have no effects on an expanded doc', function() {
    var doc = utils.expandDoc({ 'foo':{ 'bar':2, 'baz':3 }, 'hi':5 });
    
    assert(doc.foo.bar === 2);
    assert(doc.foo.baz === 3);
    assert(doc.hi === 5);
  });

  it('should reverse the effects of flattenDoc', function() {
    var doc = utils.flattenDoc({ 'foo':{ 'bar':2, 'baz':3 }, 'hi':5 });
    doc = utils.expandDoc(doc);

    assert(doc.foo.bar === 2);
    assert(doc.foo.baz === 3);
    assert(doc.hi === 5);
  });

});

describe('flattenDoc', function() {

  it('should flatten an expanded query object', function() {
    var doc = utils.flattenDoc({ 'foo':{ 'bar':2, 'baz':3 }, 'hi':5 });

    assert(doc['foo.bar'] === 2);
    assert(doc['foo.baz'] === 3);
    assert(doc.hi === 5);
  });

  it('should have no effects on a flattened doc', function() {
    var doc = utils.flattenDoc({ 'foo':1, 'foo.bar':2, 'foo.baz':3, 'hi':5 });

    assert(doc['foo.bar'] === 2);
    assert(doc['foo.baz'] === 3);
    assert(doc.hi === 5);

  });

  it('should reverse the effects of expandDoc', function() {
    var doc = utils.expandDoc({ 'foo':1, 'foo.bar':2, 'foo.baz':3, 'hi':5 });
    doc = utils.flattenDoc(doc);

    assert(doc['foo.bar'] === 2);
    assert(doc['foo.baz'] === 3);
    assert(doc.hi === 5);
  });

});

describe('encryptPasswords, comparePasswords', function() {

  it('should accurately compare a plaintext password with its encrypted form', function() {
    var plainPass = '1234567890!@#$%^&*()qwertyuiopASDFGHJKLzxcVBNM<>?;';
    var encryptedPass = utils.encryptPassword(plainPass);
    assert(utils.comparePasswords(plainPass, encryptedPass));
  });

});

describe('interceptFunctions', function() {

  it('...? Todo');

});

