/**
 * Cashiers Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var consumers = {
    id: {
      type: 'int'
    , meta: 'primary key references users(id) on delete cascade'
    , validators: { isInt:[] }
    }
  , businessId: {
      type: 'int'
    , meta: 'references businesses(id) on delete set null'
    , validators: { isInt:[] }
    }
  , locationId: {
      type: 'int'
    , meta: 'references locations(id) on delete set null'
    , validators: { isInt:[] }
    }
  };
  return consumers;
});