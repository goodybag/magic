/**
 * Users <-> Groups Relation Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var usersGroups = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , userId: {
      type: 'int'
    , validators: { isInt:[] }
    }
  , groupId: {
      type: 'int'
    , validators: { isInt:[] }
    }
  };
  return usersGroups;
});