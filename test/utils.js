var assert = require('better-assert');
var sinon = require('sinon');

var utils = require('../lib/utils');

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

