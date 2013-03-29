/**
 * Business Requests Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var visits = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
  , name: {
      type: 'text'
    }
  , date: {
      type: 'timestamp'
    , meta: 'default now() not null'
    }
  };
  return visits;
});