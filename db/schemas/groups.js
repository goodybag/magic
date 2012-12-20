/**
 * Groups Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var groups = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , name: {
      type: 'text'
    , sanitizers: { trim: true }
    }
  };
  return groups;
});